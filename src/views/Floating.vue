<template>
  <FloatingButton
    :size-px="sizePx"
    :transparency-percent="transparencyPercent"
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
  let removeConfigListener: (() => void) | null = null

  async function initConfig() {
    const cfg = await floatingButtonApi.getConfig()
    applyConfig(cfg)
  }

  function applyConfig(cfg: FloatingButtonConfig | FloatingConfigUpdatedPayload) {
    sizePx.value = Math.round(50 * ((cfg.sizePercent ?? 100) / 100))
    transparencyPercent.value = cfg.transparencyPercent ?? 20
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
