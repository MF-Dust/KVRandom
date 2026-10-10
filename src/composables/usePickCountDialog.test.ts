import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { usePickCountDialog } from './usePickCountDialog'
import { audioApi } from '../api/audioApi'
import { pickCountApi } from '../api/pickCountApi'
import { createDefaultConfig } from '../configDefaults'

vi.mock('../api/audioApi', () => ({
  audioApi: {
    playClickSoundSafely: vi.fn(),
    stopBgmSafely: vi.fn(),
    playBgm: vi.fn().mockResolvedValue(undefined),
  },
}))
vi.mock('../api/pickCountApi', () => ({
  pickCountApi: {
    getConfig: vi.fn(),
    onOpen: vi.fn(() => vi.fn()),
    onStopBgm: vi.fn(() => vi.fn()),
  },
}))
vi.mock('../api/desktopCore', () => ({
  invoke: vi.fn().mockResolvedValue(false),
}))

describe('usePickCountDialog BGM configuration', () => {
  let wrapper: VueWrapper | undefined
  let state: ReturnType<typeof usePickCountDialog>

  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
    vi.mocked(pickCountApi.getConfig).mockResolvedValue(createDefaultConfig().pickCountDialog)
  })

  afterEach(() => {
    wrapper?.unmount()
    wrapper = undefined
    vi.useRealTimers()
  })

  it.each([
    { configuredVolume: 0, expectedVolume: 0 },
    { configuredVolume: -0.5, expectedVolume: 0 },
    { configuredVolume: 1.5, expectedVolume: 1 },
  ])(
    'plays default BGM on open at volume $expectedVolume (configured=$configuredVolume)',
    async ({ configuredVolume, expectedVolume }) => {
      wrapper = mount(
        defineComponent({
          setup() {
            state = usePickCountDialog()
            return () => null
          },
        })
      )
      await flushPromises()
      expect(audioApi.playBgm).not.toHaveBeenCalled()

      const config = {
        ...createDefaultConfig().pickCountDialog,
        defaultPlayMusic: true,
        bgmVolume: configuredVolume,
      }
      const onOpen = vi.mocked(pickCountApi.onOpen).mock.calls[0][0]
      onOpen({ config })
      await flushPromises()
      await vi.advanceTimersByTimeAsync(0)

      expect(state.playMusic.value).toBe(true)
      expect(audioApi.playBgm).toHaveBeenCalledWith(config.bgmPaths, expectedVolume)
      for (const call of vi.mocked(audioApi.playBgm).mock.calls) {
        expect(call).toEqual([config.bgmPaths, expectedVolume])
      }
    }
  )
})
