import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import { useRecruitFlow } from './useRecruitFlow'
import Recruit from '../views/Recruit.vue'
import { appApi } from '../api/appApi'
import { recruitApi } from '../api/recruitApi'
import { pickCountApi } from '../api/pickCountApi'
import { createDefaultConfig } from '../configDefaults'

// 静态资源不参与窗口取消行为，避免 Windows 测试加载根路径图片。
vi.mock('/image/credit.png', () => ({ default: '/image/credit.png' }))
vi.mock('/image/pyroxene.png', () => ({ default: '/image/pyroxene.png' }))
vi.mock('/image/recruit_ticket_10.webp', () => ({ default: '/image/recruit_ticket_10.webp' }))
vi.mock('/image/recruit_ticket_1.webp', () => ({ default: '/image/recruit_ticket_1.webp' }))
vi.mock('/image/recruit_envelope_1.png', () => ({ default: '/image/recruit_envelope_1.png' }))
vi.mock('/image/recruit_envelope_10.png', () => ({ default: '/image/recruit_envelope_10.png' }))
vi.mock('/image/select_ticket.png', () => ({ default: '/image/select_ticket.png' }))

vi.mock('../api/audioApi', () => ({
  audioApi: { playClickSoundSafely: vi.fn() },
}))
vi.mock('../api/appApi', () => ({
  appApi: {
    getConfig: vi.fn(),
    onConfigUpdated: vi.fn(() => vi.fn()),
  },
}))
vi.mock('../api/recruitApi', () => ({
  recruitApi: {
    closeRecruit: vi.fn().mockResolvedValue(undefined),
    openConfig: vi.fn().mockResolvedValue(undefined),
    onWindowVisible: vi.fn(() => vi.fn()),
  },
}))
vi.mock('../api/pickCountApi', () => ({
  pickCountApi: { confirm: vi.fn().mockResolvedValue(undefined) },
}))
vi.mock('../api/pickResultApi', () => ({
  pickResultApi: {
    onOpen: vi.fn(() => vi.fn()),
    onReset: vi.fn(() => vi.fn()),
  },
}))

describe('useRecruitFlow', () => {
  it('does not play video until playVideoAndExecute is called', () => {
    const { isPlayingVideo } = useRecruitFlow()
    expect(isPlayingVideo.value).toBe(false)
  })

  it('marks video as playing on trigger and runs pending action on video end', async () => {
    const { isPlayingVideo, playVideoAndExecute, handleVideoEnd } = useRecruitFlow()
    let calls = 0
    playVideoAndExecute(async () => {
      calls += 1
    })
    expect(isPlayingVideo.value).toBe(true)
    expect(calls).toBe(0)

    await handleVideoEnd()
    expect(isPlayingVideo.value).toBe(false)
    expect(calls).toBe(1)
  })

  it('runs pending action when skipVideo is invoked', async () => {
    const { playVideoAndExecute, skipVideo, isPlayingVideo } = useRecruitFlow()
    let resolved = false
    playVideoAndExecute(async () => {
      resolved = true
    })

    await skipVideo()
    expect(resolved).toBe(true)
    expect(isPlayingVideo.value).toBe(false)
  })

  it('only runs each pending action once', async () => {
    const { playVideoAndExecute, handleVideoEnd } = useRecruitFlow()
    let calls = 0
    playVideoAndExecute(async () => {
      calls += 1
    })

    await handleVideoEnd()
    await handleVideoEnd()
    expect(calls).toBe(1)
  })

  it('cancels pending actions even if ended or skip arrives later', async () => {
    const flow = useRecruitFlow()
    const action = vi.fn().mockResolvedValue(undefined)
    flow.playVideoAndExecute(action)

    flow.cancel()
    expect(flow.isPlayingVideo.value).toBe(false)
    await flow.handleVideoEnd()
    await flow.skipVideo()
    expect(action).not.toHaveBeenCalled()
  })

  it('can run a new action after cancellation', async () => {
    const flow = useRecruitFlow()
    const cancelledAction = vi.fn().mockResolvedValue(undefined)
    const newAction = vi.fn().mockResolvedValue(undefined)
    flow.playVideoAndExecute(cancelledAction)
    flow.cancel()
    flow.playVideoAndExecute(newAction)

    expect(flow.isPlayingVideo.value).toBe(true)
    await flow.skipVideo()
    await flow.handleVideoEnd()
    expect(cancelledAction).not.toHaveBeenCalled()
    expect(newAction).toHaveBeenCalledTimes(1)
    expect(flow.isPlayingVideo.value).toBe(false)
  })
})

describe('Recruit video cancellation', () => {
  let wrapper: VueWrapper | undefined

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    const config = createDefaultConfig()
    config.studentList = [{ name: '阿罗娜', weight: 1 }]
    config.recruitConfig.autoSkipVideo = false
    config.recruitPools = [
      {
        ...config.recruitPools[0],
        id: 'pool_a',
        gachaType: 'gacha',
        bgVideo: null,
        bgImage: null,
      },
    ]
    vi.mocked(appApi.getConfig).mockResolvedValue(config)
  })

  afterEach(() => {
    wrapper?.unmount()
    wrapper = undefined
    localStorage.clear()
  })

  const startRecruit = async () => {
    wrapper = mount(Recruit, { global: { stubs: { PickResult: true } } })
    await flushPromises()
    await wrapper.get('.gacha-buttons-wrapper .btn-single').trigger('click')
    return wrapper
  }

  it('cancels on native hide, removes the video and allows a new draw on reopen', async () => {
    const view = await startRecruit()
    const video = view.get('.gacha-video')
    const overlay = view.get('.video-overlay')
    const onVisible = vi.mocked(recruitApi.onWindowVisible).mock.calls[0][0]

    onVisible(false)
    await nextTick()
    expect(view.find('.gacha-video').exists()).toBe(false)
    await video.trigger('ended')
    await overlay.trigger('click')
    expect(pickCountApi.confirm).not.toHaveBeenCalled()
    expect(localStorage.getItem('ba_recruit_currencies')).toBeNull()

    onVisible(true)
    await nextTick()
    await view.get('.gacha-buttons-wrapper .btn-single').trigger('click')
    await view.get('.gacha-video').trigger('ended')
    await flushPromises()
    expect(pickCountApi.confirm).toHaveBeenCalledExactlyOnceWith(1, false, 'recruit', 'pool_a')
    expect(JSON.parse(localStorage.getItem('ba_recruit_currencies')!).recruitTicket1).toBe(4)
  })

  it.each(['exit', 'unmount'])('cancels on %s before a late video event', async (reason) => {
    const view = await startRecruit()
    const video = view.get('.gacha-video')
    const overlay = view.get('.video-overlay')
    if (reason === 'exit') {
      await view.get('.header-back-btn').trigger('click')
      expect(recruitApi.closeRecruit).toHaveBeenCalledTimes(1)
      expect(view.find('.gacha-video').exists()).toBe(false)
    } else {
      view.unmount()
      wrapper = undefined
    }

    await video.trigger('ended')
    await overlay.trigger('click')
    expect(pickCountApi.confirm).not.toHaveBeenCalled()
    expect(localStorage.getItem('ba_recruit_currencies')).toBeNull()
  })
})
