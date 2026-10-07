import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'

let receive: (event: { data: unknown }) => void
let sent: Record<string, unknown>[]

beforeEach(() => {
  vi.resetModules()
  sent = []
  window.__KV_DESKTOP__ = true
  window.chrome = {
    webview: {
      postMessage: (message) => sent.push(message as Record<string, unknown>),
      addEventListener: (_event, callback) => {
        receive = callback
      },
    },
  }
})

afterEach(() => {
  delete window.chrome
  delete window.__KV_DESKTOP__
})

describe('desktop bridge', () => {
  it('correlates concurrent requests even when replies arrive out of order', async () => {
    const { invoke } = await import('./desktopCore')
    const first = invoke<string>('first', { count: 2 })
    const second = invoke<string>('second')
    expect(sent[0]).toMatchObject({ type: 'invoke', cmd: 'first', args: { count: 2 } })
    receive({ data: { type: 'response', id: sent[1].id, ok: true, result: 'B' } })
    receive({ data: { type: 'response', id: sent[0].id, ok: true, result: 'A' } })
    expect(await first).toBe('A')
    expect(await second).toBe('B')
  })

  it('surfaces native command errors', async () => {
    const { invoke } = await import('./desktopCore')
    const request = invoke('save_app_config')
    const rejected = expect(request).rejects.toThrow('配置错误')
    receive({ data: { type: 'response', id: sent[0].id, ok: false, error: '配置错误' } })
    await rejected
  })

  it('registers event handlers synchronously and supports unsubscribe', async () => {
    const { listenEvent, notifyRendererReady } = await import('./desktopCore')
    const callback = vi.fn()
    const unsubscribe = listenEvent('pick-result-open', callback)
    notifyRendererReady()
    expect(sent).toEqual([{ type: 'ready' }])
    receive({ data: { type: 'event', event: 'pick-result-open', payload: { token: 1 } } })
    expect(callback).toHaveBeenCalledWith({ token: 1 })
    unsubscribe()
    receive({ data: { type: 'event', event: 'pick-result-open', payload: { token: 2 } } })
    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('rejects browser-only calls without sending native messages', async () => {
    const { invoke } = await import('./desktopCore')
    delete window.__KV_DESKTOP__
    await expect(invoke('get_config')).rejects.toThrow('桌面应用')
    expect(sent).toEqual([])
  })
})
