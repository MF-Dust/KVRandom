// Run after npm run build on Windows. Uses only Node's built-in CDP/WebSocket support.
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdtemp, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { setTimeout as delay } from 'node:timers/promises'

const folder = await mkdtemp(path.join(tmpdir(), 'KVRandom-smoke-'))
const sockets = []
let app
const endpoint = 'http://127.0.0.1:9229/json/list'
async function poll(action) {
  const deadline = Date.now() + 60000
  while (Date.now() < deadline) {
    if (app?.exitCode != null) throw new Error(`Desktop exited: ${app.exitCode}`)
    const value = await action().catch(() => null)
    if (value) return value
    await delay(200)
  }
  throw new Error('Desktop smoke test timed out')
}
async function page(route) {
  const target = await poll(async () =>
    (await (await fetch(endpoint)).json()).find(
      (t) => t.type === 'page' && t.url === `https://kvrandom.local/index.html${route}`
    )
  )
  const socket = new WebSocket(target.webSocketDebuggerUrl)
  sockets.push(socket)
  await new Promise((resolve, reject) => {
    socket.onopen = resolve
    socket.onerror = reject
  })
  let id = 0
  const pending = new Map()
  socket.onmessage = ({ data }) => {
    const result = JSON.parse(data)
    const request = pending.get(result.id)
    if (!request) return
    pending.delete(result.id)
    if (result.error) request.reject(new Error(JSON.stringify(result.error)))
    else request.resolve(result.result)
  }
  async function evaluate(expression) {
    const requestId = ++id
    const response = new Promise((resolve, reject) => pending.set(requestId, { resolve, reject }))
    socket.send(
      JSON.stringify({
        id: requestId,
        method: 'Runtime.evaluate',
        params: { expression, awaitPromise: true, returnByValue: true },
      })
    )
    const result = await Promise.race([
      response,
      delay(30000).then(() => {
        throw new Error('CDP evaluation timed out')
      }),
    ])
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails))
    return result.result.value
  }
  await poll(() =>
    evaluate('document.querySelector("#app")?.children.length > 0 && window.__KV_DESKTOP__')
  )
  await evaluate(`window.smokeInvoke = (cmd, args = {}) => new Promise((resolve, reject) => {
    const id = 100000 + Math.floor(Math.random() * 100000000);
    const receive = ({data}) => { if(data.type !== 'response' || data.id !== id) return;
      chrome.webview.removeEventListener('message', receive);
      data.ok ? resolve(data.result) : reject(new Error(data.error)); };
    chrome.webview.addEventListener('message', receive);
    chrome.webview.postMessage({type:'invoke',id,cmd,args});
  })`)
  return {
    evaluate,
    invoke: (cmd, args = {}) =>
      evaluate(`smokeInvoke(${JSON.stringify(cmd)},${JSON.stringify(args)})`),
  }
}
try {
  const occupied = await fetch(endpoint).then(
    () => true,
    () => false
  )
  assert(!occupied, 'Port 9229 must be free')
  await writeFile(
    path.join(folder, 'config.yml'),
    'floatingButton:\n  mode: simple\npickResultDialog:\n  defaultPlayGachaSound: false\n'
  )
  await writeFile(
    path.join(folder, 'list.yaml'),
    'students:\n  - name: Smoke Alice\n    weight: 1\n  - name: Smoke Bob\n    weight: 1\n'
  )
  app = spawn(path.resolve('release/win-x64/kvrandom.exe'), ['--data-dir', folder], {
    env: { ...process.env, WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS: '--remote-debugging-port=9229' },
    stdio: 'inherit',
  })
  app.on('error', (error) => {
    throw error
  })
  const floating = await page('')
  await poll(() => floating.invoke('is_window_visible'))
  await poll(() =>
    floating.evaluate('document.querySelector(".floating-button img")?.naturalWidth > 0')
  )
  console.log('PASS: floating window and bundled image')
  await floating.invoke('open_config')
  const config = await page('#/config')
  const value = await config.invoke('get_config')
  assert.equal(value.studentList.length, 2)
  assert.equal((await config.invoke('get_app_info')).version, '26.5.3')
  value.recruitConfig.autoSkipVideo = true
  await config.invoke('save_app_config', { config: value })
  assert.equal((await floating.invoke('get_config')).recruitConfig.autoSkipVideo, true)
  console.log('PASS: config window, native IPC and YAML save')
  await floating.invoke('floating_button_clicked')
  const count = await page('#/pick-count')
  assert.equal(await count.invoke('is_window_visible'), true)
  await floating.invoke('confirm_pick_count', { count: 2 })
  const result = await page('#/pick-result')
  assert.equal((await result.invoke('get_pick_results')).length, 2)
  await poll(() => result.evaluate('document.body.textContent.includes("Smoke")'))
  await floating.invoke('close_pick_result')
  assert.equal(await floating.invoke('is_window_visible'), true)
  console.log('PASS: pick-count/result windows and renderer events')
  await floating.invoke('open_recruit')
  const recruit = await page('#/recruit')
  assert.equal(await recruit.invoke('is_window_visible'), true)
  await floating.invoke('confirm_pick_count', {
    count: 10,
    source: 'recruit',
    poolId: 'pool_shiroko',
  })
  assert.equal((await recruit.invoke('get_pick_results')).length, 10)
  await floating.invoke('close_pick_result')
  await floating.invoke('confirm_select_student', {
    studentName: 'Smoke Alice',
    source: 'recruit',
    poolId: 'pool_select',
  })
  assert.equal((await recruit.invoke('get_pick_results'))[0].name, 'Smoke Alice')
  await floating.invoke('close_pick_result')
  await floating.invoke('close_recruit')
  console.log('PASS: recruit draw/select and close lifecycle')
  await floating.invoke('play_click_sound', { volume: 0 })
  await floating.invoke('play_gacha_sound', { volume: 0 })
  await floating.invoke('stop_gacha_sound')
  await floating.invoke('play_bgm', { volume: 0 })
  await floating.invoke('stop_bgm')
  console.log('PASS: bundled WAV/OGG/MP3 audio decoding')
  const localImage = path.resolve('public/image/app.ico')
  const assetUrl = `https://assets.kvrandom.local/file?path=${encodeURIComponent(localImage)}`
  const media = await floating.evaluate(
    `(async () => { const image = new Image(); image.src = ${JSON.stringify(assetUrl)}; await image.decode(); return image.naturalWidth > 0; })()`
  )
  assert.equal(media, true)
  await floating.invoke('play_gacha_sound', {
    path: path.resolve('public/sound/gacha_loading.ogg'),
    volume: 0,
  })
  await floating.invoke('stop_gacha_sound')
  console.log('PASS: external local image and OGG media')
  const errors = (await floating.invoke('get_logs')).filter((log) => log.level === 'error')
  assert.deepEqual(errors, [], 'Backend must not report errors')
  console.log('All desktop smoke checks passed.')
} finally {
  for (const socket of sockets) socket.close()
  if (app?.pid && app.exitCode == null) {
    const exit = new Promise((resolve) => app.once('exit', resolve))
    const kill = spawn('taskkill', ['/pid', String(app.pid), '/T', '/F'], { stdio: 'ignore' })
    await new Promise((resolve) => kill.once('exit', resolve))
    await exit
  }
  await rm(folder, { recursive: true, force: true })
}
