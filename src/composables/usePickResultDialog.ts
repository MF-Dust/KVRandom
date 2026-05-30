import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { audioApi } from '../api/audioApi'
import { pickResultApi } from '../api/pickResultApi'
import type {
  PickResultDialogConfig,
  PickResultOpenPayload,
  PickResultResetPayload,
  PickedStudent,
} from '@/types'

type RawResult =
  | string
  | {
      name?: unknown
      rarity?: string
    }
  | null
  | undefined

export function usePickResultDialog() {
  const results = ref<PickedStudent[]>([])
  const animationKey = ref(0)
  const revealStarted = ref(false)
  const canClose = ref(false)
  const isClosing = ref(false)
  const lastToken = ref(0)
  const playGachaSound = ref(true)
  const gachaSoundVolume = ref(0.6)
  const gachaSoundPath = ref('sound/gacha_loading.ogg')
  const backgroundDarknessPercent = ref(35)
  const blueEnvelopeImage = ref('/image/blue.png')
  const goldEnvelopeImage = ref('/image/gold.png')
  const pinkEnvelopeImage = ref('/image/pink.png')
  const cardSizePercent = ref(100)
  const flyIntervalMs = ref(80)
  const revealDelayMs = ref(420)
  const closeFadeMs = ref(220)
  const closeHintText = ref('点一下就关掉哦～')
  const emptyText = ref('还没有点名结果呢～')
  const confirmButtonText = ref('确认')
  const drawAgainButtonText = ref('再次抽取')
  const resultMode = ref('quick')
  const instructionText = computed(() =>
    resultMode.value === 'full' ? '点一下回到快速模式～' : closeHintText.value
  )
  const stageStyle = computed(() => ({
    background: `rgba(0, 0, 0, ${Math.max(0, Math.min(100, backgroundDarknessPercent.value)) / 100})`,
    '--result-card-scale': String(Math.max(0.5, Math.min(2, cardSizePercent.value / 100))),
    '--result-fly-interval': `${flyIntervalMs.value}ms`,
    '--result-close-fade': `${closeFadeMs.value}ms`,
  }))

  let revealTimer: ReturnType<typeof setTimeout> | null = null
  let closeTimer: ReturnType<typeof setTimeout> | null = null
  let closeFadeTimer: ReturnType<typeof setTimeout> | null = null
  let removeOpenListener: (() => void) | null = null
  let removeResetListener: (() => void) | null = null

  const topRow = computed(() => results.value.slice(0, 5))
  const bottomRow = computed(() => results.value.slice(5))
  const isTwoRows = computed(() => results.value.length > 5)

  const normalizeResults = (
    payload: PickResultOpenPayload | { results: unknown[] } | unknown[] | null
  ): PickedStudent[] => {
    const list = Array.isArray((payload as { results?: unknown[] })?.results)
      ? (payload as { results: unknown[] }).results
      : (payload as unknown[])
    if (!Array.isArray(list)) return []
    return list
      .map((rawItem): PickedStudent | null => {
        const item = rawItem as RawResult
        if (!item) return null
        const name =
          typeof item === 'string'
            ? item.trim()
            : String((item as { name?: unknown }).name || '').trim()
        if (!name) return null

        const rarity =
          typeof item === 'object' && item && 'rarity' in item && item.rarity
            ? String(item.rarity)
            : 'blue'

        return { name, rarity }
      })
      .filter((item): item is PickedStudent => item !== null)
  }

  const stopGachaLoadingSound = () => {
    audioApi.stopGachaSound().catch(() => {})
  }

  const playGachaLoadingSound = async () => {
    await audioApi.playGachaSound(
      Math.max(0, Math.min(1, Number(gachaSoundVolume.value) || 0)),
      gachaSoundPath.value
    )
  }

  const resetResultState = ({ stopSound = true } = {}) => {
    results.value = []
    animationKey.value += 1
    revealStarted.value = false
    canClose.value = false
    isClosing.value = false
    resultMode.value = 'quick'
    if (revealTimer) {
      clearTimeout(revealTimer)
      revealTimer = null
    }
    if (closeTimer) {
      clearTimeout(closeTimer)
      closeTimer = null
    }
    if (closeFadeTimer) {
      clearTimeout(closeFadeTimer)
      closeFadeTimer = null
    }
    if (stopSound) {
      stopGachaLoadingSound()
    }
  }

  const applySoundConfig = (cfg: PickResultDialogConfig | null | undefined) => {
    if (!cfg) return
    playGachaSound.value = Boolean(cfg.defaultPlayGachaSound)
    gachaSoundVolume.value = Number(cfg.gachaSoundVolume)
    gachaSoundPath.value = cfg.gachaSoundPath || gachaSoundPath.value
    backgroundDarknessPercent.value = Number(cfg.backgroundDarknessPercent ?? 35)
    blueEnvelopeImage.value = cfg.blueEnvelopeImage || blueEnvelopeImage.value
    goldEnvelopeImage.value = cfg.goldEnvelopeImage || goldEnvelopeImage.value
    pinkEnvelopeImage.value = cfg.pinkEnvelopeImage || pinkEnvelopeImage.value
    cardSizePercent.value = Number(cfg.cardSizePercent ?? 100)
    flyIntervalMs.value = Number(cfg.flyIntervalMs ?? 80)
    revealDelayMs.value = Number(cfg.revealDelayMs ?? 420)
    closeFadeMs.value = Number(cfg.closeFadeMs ?? 220)
    closeHintText.value = cfg.closeHintText || closeHintText.value
    emptyText.value = cfg.emptyText || emptyText.value
    confirmButtonText.value = cfg.confirmButtonText || confirmButtonText.value
    drawAgainButtonText.value = cfg.drawAgainButtonText || drawAgainButtonText.value
  }

  const applyResults = (payload: PickResultOpenPayload | { results: unknown[] }) => {
    resetResultState({ stopSound: false })
    applySoundConfig((payload as PickResultOpenPayload)?.config)
    results.value = normalizeResults(payload)
    const token = Number((payload as PickResultOpenPayload)?.token)
    if (Number.isFinite(token)) {
      lastToken.value = token
    }

    if (results.value.length === 0) {
      canClose.value = true
      return
    }

    resultMode.value = 'quick'

    const totalDelayMs =
      Math.max(results.value.length - 1, 0) * flyIntervalMs.value + revealDelayMs.value
    revealTimer = setTimeout(() => {
      revealStarted.value = true
    }, totalDelayMs)

    const totalDurationMs = totalDelayMs + 320
    closeTimer = setTimeout(() => {
      canClose.value = true
    }, totalDurationMs)

    if (playGachaSound.value) {
      playGachaLoadingSound()
    }
  }

  const handleReset = (payload: PickResultResetPayload | null) => {
    const token = Number(payload?.token)
    const reason = payload?.reason
    if (Number.isFinite(token)) {
      if (reason === 'before-open' && token === lastToken.value) {
        return
      }
      if (token < lastToken.value) {
        return
      }
      lastToken.value = token
    }
    resetResultState()
  }

  const closeResult = async () => {
    if (isClosing.value) return
    isClosing.value = true
    closeFadeTimer = setTimeout(async () => {
      resetResultState()
      await nextTick()
      await new Promise((resolve) => window.requestAnimationFrame(resolve))
      pickResultApi.close()
    }, closeFadeMs.value)
  }

  const handleStageClick = () => {
    if (!canClose.value || isClosing.value) return
    closeResult()
  }

  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && canClose.value && !isClosing.value) {
      closeResult()
    }
  }

  const loadSoundConfig = async (configOverride?: PickResultDialogConfig | null) => {
    applySoundConfig(configOverride || (await pickResultApi.getConfig()))
  }

  onMounted(async () => {
    await loadSoundConfig()

    const initial = await pickResultApi.getResults()
    applyResults({ results: initial })

    removeOpenListener = pickResultApi.onOpen(async (payload) => {
      await loadSoundConfig(payload?.config)
      applyResults(payload)
    })

    removeResetListener = pickResultApi.onReset((payload) => {
      handleReset(payload)
    })
  })

  onBeforeUnmount(() => {
    resetResultState()
    if (typeof removeOpenListener === 'function') {
      removeOpenListener()
    }
    if (typeof removeResetListener === 'function') {
      removeResetListener()
    }
  })

  return {
    results,
    animationKey,
    instructionText,
    stageStyle,
    blueEnvelopeImage,
    goldEnvelopeImage,
    pinkEnvelopeImage,
    emptyText,
    confirmButtonText,
    drawAgainButtonText,
    revealStarted,
    canClose,
    isClosing,
    topRow,
    bottomRow,
    isTwoRows,
    closeResult,
    handleStageClick,
    handleKeydown,
  }
}
