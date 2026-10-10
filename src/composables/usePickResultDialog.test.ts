import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { usePickResultDialog } from './usePickResultDialog'
import { pickResultApi } from '../api/pickResultApi'
import { createDefaultConfig } from '../configDefaults'

vi.mock('../api/audioApi', () => ({
  audioApi: {
    playGachaSound: vi.fn().mockResolvedValue(undefined),
    stopGachaSoundSafely: vi.fn(),
  },
}))
vi.mock('../api/pickResultApi', () => ({
  pickResultApi: {
    getConfig: vi.fn(),
    getResults: vi.fn().mockResolvedValue([]),
    onOpen: vi.fn(() => vi.fn()),
    onReset: vi.fn(() => vi.fn()),
    close: vi.fn().mockResolvedValue(undefined),
  },
}))

describe('usePickResultDialog animation timing', () => {
  let wrapper: VueWrapper | undefined
  let state: ReturnType<typeof usePickResultDialog>

  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
    vi.mocked(pickResultApi.getConfig).mockResolvedValue(createDefaultConfig().pickResultDialog)
  })

  afterEach(() => {
    wrapper?.unmount()
    wrapper = undefined
    vi.useRealTimers()
  })

  const mountDialog = async () => {
    wrapper = mount(
      defineComponent({
        setup() {
          state = usePickResultDialog()
          return () => null
        },
      })
    )
    await flushPromises()
  }

  const openResults = async (count: number, revealDelayMs = 420, token = 1) => {
    const onOpen = vi.mocked(pickResultApi.onOpen).mock.calls[0][0]
    onOpen({
      token,
      results: Array.from({ length: count }, (_, index) => ({
        name: `学生${index}`,
        rarity: 'blue',
      })),
      config: {
        ...createDefaultConfig().pickResultDialog,
        flyIntervalMs: 80,
        revealDelayMs,
        defaultPlayGachaSound: false,
      },
    })
    await flushPromises()
  }

  it.each([
    { count: 1, revealDelayMs: 420, revealAt: 420, finishedAt: 820 },
    { count: 10, revealDelayMs: 420, revealAt: 1140, finishedAt: 2260 },
    { count: 1, revealDelayMs: 0, revealAt: 0, finishedAt: 420 },
    { count: 10, revealDelayMs: 0, revealAt: 720, finishedAt: 1840 },
  ])(
    'waits for all animations ($count results, revealDelay=$revealDelayMs)',
    async ({ count, revealDelayMs, revealAt, finishedAt }) => {
      await mountDialog()
      await openResults(count, revealDelayMs)
      expect(state.canClose.value).toBe(false)

      if (revealAt > 0) {
        await vi.advanceTimersByTimeAsync(revealAt - 1)
        expect(state.revealStarted.value).toBe(false)
        await vi.advanceTimersByTimeAsync(1)
      } else {
        await vi.advanceTimersByTimeAsync(0)
      }
      expect(state.revealStarted.value).toBe(true)
      await vi.advanceTimersByTimeAsync(finishedAt - revealAt - 1)
      expect(state.canClose.value).toBe(false)
      state.handleStageClick()
      state.handleKeydown(new KeyboardEvent('keydown', { key: 'Escape' }))
      expect(state.isClosing.value).toBe(false)
      expect(pickResultApi.close).not.toHaveBeenCalled()

      await vi.advanceTimersByTimeAsync(1)
      expect(state.canClose.value).toBe(true)
    }
  )

  it('clears both animation timers on reset and starts fresh when reopened', async () => {
    await mountDialog()
    await openResults(10)
    await vi.advanceTimersByTimeAsync(500)
    vi.mocked(pickResultApi.onReset).mock.calls[0][0]({ token: 1, reason: 'close' })
    await vi.runAllTimersAsync()

    expect(vi.getTimerCount()).toBe(0)
    expect(state.results.value).toEqual([])
    expect(state.revealStarted.value).toBe(false)
    expect(state.canClose.value).toBe(false)

    await openResults(1, 420, 2)
    await vi.advanceTimersByTimeAsync(819)
    expect(state.canClose.value).toBe(false)
    await vi.advanceTimersByTimeAsync(1)
    expect(state.canClose.value).toBe(true)
  })

  it('clears pending animation timers and listeners on unmount', async () => {
    await mountDialog()
    await openResults(10)
    wrapper!.unmount()
    wrapper = undefined
    await vi.runAllTimersAsync()

    expect(vi.getTimerCount()).toBe(0)
    expect(state.revealStarted.value).toBe(false)
    expect(state.canClose.value).toBe(false)
    expect(vi.mocked(pickResultApi.onOpen).mock.results[0].value).toHaveBeenCalledTimes(1)
    expect(vi.mocked(pickResultApi.onReset).mock.results[0].value).toHaveBeenCalledTimes(1)
  })
})
