import { describe, it, expect } from 'vitest'
import { useRecruitFlow } from './useRecruitFlow'

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
})
