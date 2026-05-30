<template>
  <FloatingButton
    :size-px="sizePx"
    :transparency-percent="transparencyPercent"
    :icon-path="iconPath"
    :background="background"
    :border-radius-percent="borderRadiusPercent"
    :click-sound-enabled="clickSoundEnabled"
    :click-sound-path="clickSoundPath"
    :click-sound-volume="clickSoundVolume"
    :drag-threshold-px="dragThresholdPx"
    @click="handleFloatingButtonClick"
  />
</template>

<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount } from 'vue'
  import { floatingButtonApi } from '../api/floatingButtonApi'
  import type { FloatingButtonConfig, FloatingConfigUpdatedPayload } from '@/types'
  import FloatingButton from '../components/FloatingButton.vue'

  const sizePx = ref(50)
  const transparencyPercent = ref(20)
  const iconPath = ref('/image/random.svg')
  const background = ref('linear-gradient(145deg, #66ccff, #4091f0)')
  const borderRadiusPercent = ref(50)
  const clickSoundEnabled = ref(true)
  const clickSoundPath = ref('sound/button_click.wav')
  const clickSoundVolume = ref(1)
  const dragThresholdPx = ref(3)
  let removeConfigListener: (() => void) | null = null

  async function initConfig() {
    const cfg = await floatingButtonApi.getConfig()
    applyConfig(cfg)
  }

  function applyConfig(cfg: FloatingButtonConfig | FloatingConfigUpdatedPayload) {
    sizePx.value = Math.round(50 * ((cfg.sizePercent ?? 100) / 100))
    transparencyPercent.value = cfg.transparencyPercent ?? 20
    iconPath.value = cfg.iconPath || '/image/random.svg'
    background.value = cfg.background || 'linear-gradient(145deg, #66ccff, #4091f0)'
    borderRadiusPercent.value = cfg.borderRadiusPercent ?? 50
    clickSoundEnabled.value = cfg.clickSoundEnabled ?? true
    clickSoundPath.value = cfg.clickSoundPath || 'sound/button_click.wav'
    clickSoundVolume.value = cfg.clickSoundVolume ?? 1
    dragThresholdPx.value = cfg.dragThresholdPx ?? 3
  }

  function handleFloatingButtonClick() {
    floatingButtonApi.onClick()
  }

  onMounted(() => {
    initConfig()
    removeConfigListener = floatingButtonApi.onConfigUpdated((cfg) => {
      applyConfig(cfg)
    })
  })

  onBeforeUnmount(() => {
    if (typeof removeConfigListener === 'function') {
      removeConfigListener()
    }
  })
</script>
