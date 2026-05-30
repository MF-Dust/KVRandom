<template>
  <div class="floating-root">
    <button
      class="floating-button"
      :class="{ 'is-dragging': isDragging }"
      :style="buttonStyle"
      title="点名点名～"
      @contextmenu.prevent
      @pointerdown="handlePointerDown"
      @pointermove="handlePointerMove"
      @pointerup="handlePointerUp"
      @pointercancel="handlePointerCancel"
    >
      <img :src="resolvedIconPath" alt="阿罗娜的点名按钮" draggable="false" />
    </button>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useFloatingDrag } from '../composables/useFloatingDrag'
  import { resolveAssetUrl } from '../utils/assets'

  const props = defineProps({
    sizePx: {
      type: Number,
      required: true,
    },
    transparencyPercent: {
      type: Number,
      required: true,
    },
    iconPath: {
      type: String,
      default: '/image/random.svg',
    },
    background: {
      type: String,
      default: 'linear-gradient(145deg, #66ccff, #4091f0)',
    },
    borderRadiusPercent: {
      type: Number,
      default: 50,
    },
    clickSoundEnabled: {
      type: Boolean,
      default: true,
    },
    clickSoundPath: {
      type: String,
      default: 'sound/button_click.wav',
    },
    clickSoundVolume: {
      type: Number,
      default: 1,
    },
    dragThresholdPx: {
      type: Number,
      default: 3,
    },
  })

  const emit = defineEmits(['click'])

  const styleOpacity = computed(() => {
    return Math.max(0, Math.min(1, 1 - props.transparencyPercent / 100))
  })

  const buttonStyle = computed(() => {
    return {
      width: `${props.sizePx}px`,
      height: `${props.sizePx}px`,
      opacity: String(styleOpacity.value),
      background: props.background,
      borderRadius: `${props.borderRadiusPercent}%`,
    }
  })

  const resolvedIconPath = computed(() => resolveAssetUrl(props.iconPath) || '/image/random.svg')

  const { isDragging, handlePointerDown, handlePointerMove, handlePointerUp, handlePointerCancel } =
    useFloatingDrag(emit, {
      clickSoundEnabled: () => props.clickSoundEnabled,
      clickSoundPath: () => props.clickSoundPath,
      clickSoundVolume: () => props.clickSoundVolume,
      dragThresholdPx: () => props.dragThresholdPx,
    })
</script>

<style scoped>
  .floating-root {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .floating-button {
    position: relative;
    border: 0;
    border-radius: 50%;
    cursor: pointer;
    touch-action: none;
    padding: 10px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(145deg, #66ccff, #4091f0);
    transition: transform 180ms ease;
  }

  .floating-button:hover {
    transform: translateY(-1px);
  }

  .floating-button:active {
    transform: translateY(1px) scale(0.985);
  }

  .floating-button.is-dragging,
  .floating-button.is-dragging:hover,
  .floating-button.is-dragging:active {
    transform: none;
    transition: none;
  }

  .floating-button img {
    width: 120%;
    height: 120%;
    object-fit: contain;
    pointer-events: none;
  }
</style>
