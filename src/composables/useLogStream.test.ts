import { describe, expect, it, vi } from 'vitest'
import { appApi } from '../api/appApi'
import { useLogStream } from './useLogStream'

vi.mock('../api/appApi', () => ({
  appApi: {
    getLogs: vi.fn(),
    onLogEntry: vi.fn(() => vi.fn()),
  },
}))

describe('useLogStream ISO timestamps', () => {
  it('formats ISO8601 timestamps from both getLogs and onLogEntry as valid local times', async () => {
    const stored = {
      id: 'stored',
      level: 'info',
      text: '启动完成',
      time: '2026-06-27T08:09:10.1234567+08:00',
    }
    const live = {
      id: 'live',
      level: 'warn',
      text: '实时日志',
      time: '2026-06-27T00:10:11.7654321Z',
    }
    vi.mocked(appApi.getLogs).mockResolvedValue([stored])
    const stream = useLogStream(appApi)
    await stream.startLogStream()
    vi.mocked(appApi.onLogEntry).mock.calls[0][0](live)

    expect(appApi.getLogs).toHaveBeenCalledTimes(1)
    expect(stream.logs.value).toHaveLength(2)
    for (const [index, entry] of [stored, live].entries()) {
      const displayed = stream.logs.value[index]
      expect(displayed).toEqual({
        ...entry,
        time: new Date(entry.time).toLocaleTimeString('zh-CN', { hour12: false }),
      })
      expect(displayed.time).toMatch(/^\d{2}:\d{2}:\d{2}$/)
    }
    stream.stopLogStream()
    expect(vi.mocked(appApi.onLogEntry).mock.results[0].value).toHaveBeenCalledTimes(1)
  })
})
