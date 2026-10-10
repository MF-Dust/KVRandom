import { ref } from 'vue'

export type RecruitAction = () => Promise<void>

/**
 * 招募开包视频状态机：触发抽卡前播放视频，视频结束或被跳过时执行
 * 真正的抽卡动作；窗口隐藏或退出时取消待执行动作。
 */
export function useRecruitFlow() {
  const isPlayingVideo = ref(false)
  let pendingRecruitAction: RecruitAction | null = null

  const playVideoAndExecute = (action: RecruitAction) => {
    pendingRecruitAction = action
    isPlayingVideo.value = true
  }

  const handleVideoEnd = async () => {
    isPlayingVideo.value = false
    if (pendingRecruitAction) {
      const action = pendingRecruitAction
      pendingRecruitAction = null
      await action()
    }
  }

  const skipVideo = () => handleVideoEnd()

  const cancel = () => {
    pendingRecruitAction = null
    isPlayingVideo.value = false
  }

  return {
    isPlayingVideo,
    playVideoAndExecute,
    handleVideoEnd,
    skipVideo,
    cancel,
  }
}
