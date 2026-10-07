import { spawn } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { setTimeout as delay } from 'node:timers/promises'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const { version } = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'))
const children = new Set()

function start(command, args) {
  const child = spawn(command, args, { cwd: root, stdio: 'inherit' })
  children.add(child)
  child.once('exit', () => children.delete(child))
  child.once('error', (error) => {
    console.error(error.message)
    stop()
    process.exitCode = 1
  })
  return child
}
function wait(child) {
  return new Promise((resolve, reject) => {
    child.once('error', reject)
    child.once('exit', (code, signal) =>
      code === 0 ? resolve() : reject(new Error(`Command failed (${code ?? signal})`))
    )
  })
}
function stop() {
  for (const child of children) {
    if (process.platform === 'win32')
      spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' })
    else child.kill('SIGTERM')
  }
}
process.on('SIGINT', () => {
  stop()
  process.exitCode = 130
})
process.on('SIGTERM', () => {
  stop()
  process.exitCode = 143
})

try {
  if (process.argv[2] === 'build') {
    await wait(start(process.execPath, ['node_modules/vite/bin/vite.js', 'build']))
    await wait(
      start('dotnet', [
        'publish',
        'src-dotnet/KVRandom.csproj',
        '-c',
        'Release',
        '-r',
        'win-x64',
        '--self-contained',
        'true',
        `-p:Version=${version}`,
        '-o',
        'release/win-x64',
      ])
    )
  } else if (process.argv[2] === 'dev') {
    const vite = start(process.execPath, ['node_modules/vite/bin/vite.js'])
    const viteDone = wait(vite)
    // Keep failures observable while waiting for the development server.
    let viteError
    viteDone.catch((error) => {
      viteError = error
    })
    let ready = false
    for (let i = 0; i < 100; i++) {
      if (viteError) throw viteError
      try {
        const response = await fetch('http://localhost:5173', { signal: AbortSignal.timeout(500) })
        if (response.ok) {
          ready = true
          break
        }
      } catch {
        /* Vite is still starting. */
      }
      await delay(200)
    }
    if (!ready) throw new Error('Vite did not start on port 5173')
    await Promise.race([
      wait(
        start('dotnet', [
          'run',
          '--project',
          'src-dotnet/KVRandom.csproj',
          `-p:Version=${version}`,
          '--',
          '--dev-url',
          'http://localhost:5173',
        ])
      ),
      viteDone.then(() => {
        throw new Error('Vite exited before the desktop app')
      }),
    ])
  } else throw new Error('Usage: node scripts/desktop.mjs dev|build')
} catch (error) {
  console.error(error.message)
  process.exitCode = 1
} finally {
  stop()
}
