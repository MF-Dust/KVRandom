import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { audioApi } from '../api/audioApi'
import { pickCountApi } from '../api/pickCountApi'
import type { PickCountDialogConfig } from '@/types'
import {
  DEFAULT_BACKGROUND_DARKNESS_PERCENT,
  DEFAULT_PICK_COUNT,
  MAX_PICK_COUNT,
  MIN_PICK_COUNT,
} from '../configDefaults'
import { clampInt } from '../utils/configHelpers'

const MIN_COUNT = MIN_PICK_COUNT
const MAX_COUNT = MAX_PICK_COUNT

export function usePickCountDialog() {
  const count = ref(DEFAULT_PICK_COUNT)
  const playMusic = ref(false)
  const isLeaving = ref(false)
  const backgroundDarknessPercent = ref(DEFAULT_BACKGROUND_DARKNESS_PERCENT)
  const isDialogOpen = ref(false)
  const isInitializing = ref(false)
  const titleText = ref('要点名几个人呢～')
  const minButtonText = ref('最少')
  const maxButtonText = ref('最多')
  const cancelButtonText = ref('先不要了')
  const confirmButtonText = ref('开始点名！')
  const musicLabelText = ref('播放超～喜庆的点名BGM！')
  const rangeHintTemplate = ref('可选范围 {min} - {max}，老师看着办～')
  const panelBackground = ref('#eff6ff')
  const bgmVolume = ref(0.3)
  const bgmPaths = ref<string[]>(['sound/bgm.mp3'])
  const allowMusicToggle = ref(true)
  const exitAnimationMs = ref(400)

  let removeOnOpenListener: (() => void) | null = null
  let removeStopListener: (() => void) | null = null
  let exitTimer: ReturnType<typeof setTimeout> | null = null

  const canDecrease = computed(() => count.value > MIN_COUNT)
  const canIncrease = computed(() => count.value < MAX_COUNT)

  const overlayStyle = computed(() => {
    const darkness = Math.max(0, Math.min(100, backgroundDarknessPercent.value))
    const alpha = darkness / 100

    return {
      backgroundColor: `rgba(0, 0, 0, ${alpha})`,
      '--pick-exit-ms': `${exitAnimationMs.value}ms`,
    }
  })
  const panelStyle = computed(() => ({
    background: panelBackground.value,
    '--pick-exit-ms': `${exitAnimationMs.value}ms`,
  }))
  const rangeHintText = computed(() =>
    rangeHintTemplate.value
      .replace(/\{min\}/g, String(MIN_COUNT))
      .replace(/\{max\}/g, String(MAX_COUNT))
  )

  const applyConfig = (cfg: PickCountDialogConfig | null | undefined) => {
    if (!cfg) return
    count.value = clampInt(cfg.defaultCount, MIN_COUNT, MAX_COUNT, DEFAULT_PICK_COUNT)
    playMusic.value = Boolean(cfg.defaultPlayMusic)
    backgroundDarknessPercent.value = clampInt(
      cfg.backgroundDarknessPercent,
      0,
      100,
      DEFAULT_BACKGROUND_DARKNESS_PERCENT
    )
    titleText.value = cfg.titleText || titleText.value
    minButtonText.value = cfg.minButtonText || minButtonText.value
    maxButtonText.value = cfg.maxButtonText || maxButtonText.value
    cancelButtonText.value = cfg.cancelButtonText || cancelButtonText.value
    confirmButtonText.value = cfg.confirmButtonText || confirmButtonText.value
    musicLabelText.value = cfg.musicLabelText || musicLabelText.value
    rangeHintTemplate.value = cfg.rangeHintText || rangeHintTemplate.value
    panelBackground.value = cfg.panelBackground || panelBackground.value
    bgmVolume.value = Math.max(0, Math.min(1, Number(cfg.bgmVolume) || 0.3))
    bgmPaths.value =
      Array.isArray(cfg.bgmPaths) && cfg.bgmPaths.length ? cfg.bgmPaths : ['sound/bgm.mp3']
    allowMusicToggle.value = cfg.allowMusicToggle ?? true
    exitAnimationMs.value = clampInt(cfg.exitAnimationMs, 0, 3000, 400)
  }

  const initConfig = async (configOverride?: PickCountDialogConfig | null) => {
    isInitializing.value = true
    try {
      applyConfig(configOverride || (await pickCountApi.getConfig()))
    } finally {
      isInitializing.value = false
    }
  }

  const playClickSound = () => {
    audioApi.playClickSoundSafely()
  }

  const increaseCount = () => {
    if (count.value < MAX_COUNT) {
      playClickSound()
      count.value += 1
    }
  }

  const decreaseCount = () => {
    if (count.value > MIN_COUNT) {
      playClickSound()
      count.value -= 1
    }
  }

  const setMinCount = () => {
    if (count.value !== MIN_COUNT) {
      playClickSound()
      count.value = MIN_COUNT
    }
  }

  const setMaxCount = () => {
    if (count.value !== MAX_COUNT) {
      playClickSound()
      count.value = MAX_COUNT
    }
  }

  const stopAudio = () => {
    audioApi.stopBgmSafely()
  }

  const playBgm = async () => {
    await audioApi.playBgm(bgmPaths.value, bgmVolume.value)
  }

  const isCurrentWindowVisible = async () => {
    if (!window.__TAURI_INTERNALS__) {
      return false
    }
    try {
      return await getCurrentWindow().isVisible()
    } catch (_error) {
      return false
    }
  }

  const resetDialogStateFromConfig = async (
    shouldPlayBgm: boolean,
    configOverride?: PickCountDialogConfig | null
  ) => {
    isLeaving.value = false
    stopAudio()
    await initConfig(configOverride)

    if (shouldPlayBgm && playMusic.value) {
      try {
        await playBgm()
      } catch (error) {
        console.warn('Failed to play bgm on open:', error)
      }
    }
  }

  const beginExit = (action: 'cancel' | 'confirm') => {
    if (isLeaving.value) {
      return
    }

    isLeaving.value = true
    isDialogOpen.value = false
    playClickSound()
    if (exitTimer) {
      clearTimeout(exitTimer)
    }
    exitTimer = window.setTimeout(async () => {
      exitTimer = null
      try {
        if (action !== 'confirm') {
          stopAudio()
        }

        if (action === 'confirm') {
          await pickCountApi.confirm(count.value, playMusic.value)
        } else {
          await pickCountApi.cancel()
        }
      } catch (error) {
        console.error('[usePickCountDialog] Dialog action failed:', error)
      }
    }, exitAnimationMs.value)
  }

  const handleCancel = () => {
    beginExit('cancel')
  }

  const handleConfirm = () => {
    beginExit('confirm')
  }

  watch(playMusic, async (enabled) => {
    if (!isDialogOpen.value || isInitializing.value) {
      return
    }
    if (enabled) {
      try {
        await playBgm()
      } catch (error) {
        console.warn('Failed to play bgm:', error)
      }
    } else {
      stopAudio()
    }
  })

  onMounted(async () => {
    isLeaving.value = false
    stopAudio()
    let openedByEvent = false

    removeOnOpenListener = pickCountApi.onOpen(async (payload) => {
      openedByEvent = true
      isDialogOpen.value = true
      await resetDialogStateFromConfig(true, payload?.config ?? null)
    })

    removeStopListener = pickCountApi.onStopBgm(() => {
      stopAudio()
    })

    await initConfig()
    if (!openedByEvent && (await isCurrentWindowVisible())) {
      isDialogOpen.value = true
      await resetDialogStateFromConfig(true)
    }
  })

  onBeforeUnmount(() => {
    stopAudio()
    if (exitTimer) {
      clearTimeout(exitTimer)
      exitTimer = null
    }
    if (typeof removeOnOpenListener === 'function') {
      removeOnOpenListener()
    }
    if (typeof removeStopListener === 'function') {
      removeStopListener()
    }
  })

  return {
    MIN_COUNT,
    MAX_COUNT,
    count,
    playMusic,
    isLeaving,
    canDecrease,
    canIncrease,
    overlayStyle,
    panelStyle,
    titleText,
    minButtonText,
    maxButtonText,
    cancelButtonText,
    confirmButtonText,
    musicLabelText,
    rangeHintText,
    allowMusicToggle,
    increaseCount,
    decreaseCount,
    setMinCount,
    setMaxCount,
    handleCancel,
    handleConfirm,
  }
}
