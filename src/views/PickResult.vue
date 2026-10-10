<script setup lang="ts">
  import { usePickResultDialog } from '../composables/usePickResultDialog'
  import { resolveAssetUrl } from '../utils/assets'

  const props = defineProps({
    isRecruitMode: {
      type: Boolean,
      default: false,
    },
  })

  const emit = defineEmits(['draw-again'])

  const {
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
  } = usePickResultDialog()

  const onStageClick = (_e: MouseEvent) => {
    if (props.isRecruitMode) return
    handleStageClick()
  }

  const handleConfirm = () => {
    if (!canClose.value || isClosing.value) return
    closeResult()
  }

  const handleDrawAgain = () => {
    if (!canClose.value || isClosing.value) return
    closeResult()
    emit('draw-again')
  }

  const onKeydown = (e: KeyboardEvent) => {
    if (props.isRecruitMode && (e.key === 'Enter' || e.key === 'Escape')) {
      handleConfirm()
    } else {
      handleKeydown(e)
    }
  }

  const envelopeImage = (rarity: string) => {
    if (rarity === 'gold') return resolveAssetUrl(goldEnvelopeImage.value)
    if (rarity === 'pink') return resolveAssetUrl(pinkEnvelopeImage.value)
    return resolveAssetUrl(blueEnvelopeImage.value)
  }
</script>

<template>
  <div
    class="result-stage"
    :class="{ 'is-closing': isClosing }"
    :style="stageStyle"
    tabindex="0"
    @click="onStageClick"
    @contextmenu.prevent
    @keydown="onKeydown"
  >
    <div v-if="results.length" class="quick-result">
      <div :key="animationKey" class="result-rows" :class="{ 'is-two-rows': isTwoRows }">
        <div class="result-row">
          <div
            v-for="(item, index) in topRow"
            :key="`top-${index}-${item.name}`"
            class="letter-card"
            :class="`is-${item.rarity}`"
            :style="{ '--index': index }"
          >
            <img class="letter-img" :src="envelopeImage(item.rarity)" alt="letter" />
            <div
              class="name-card"
              :class="{ 'is-reveal': revealStarted }"
              :style="{ '--reveal-index': index }"
            >
              <span>{{ item.name }}</span>
            </div>
          </div>
        </div>
        <div v-if="isTwoRows" class="result-row">
          <div
            v-for="(item, index) in bottomRow"
            :key="`bottom-${index}-${item.name}`"
            class="letter-card"
            :class="`is-${item.rarity}`"
            :style="{ '--index': index + 5 }"
          >
            <img class="letter-img" :src="envelopeImage(item.rarity)" alt="letter" />
            <div
              class="name-card"
              :class="{ 'is-reveal': revealStarted }"
              :style="{ '--reveal-index': index + 5 }"
            >
              <span>{{ item.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="isRecruitMode && canClose" class="recruit-actions">
      <button
        type="button"
        class="ba-btn ba-btn--lg ba-btn--blue result-action-btn"
        @click.stop="handleConfirm"
      >
        {{ confirmButtonText }}
      </button>
      <button
        v-if="results.length === 10"
        type="button"
        class="ba-btn ba-btn--lg ba-btn--yellow ba-btn--shine result-action-btn"
        @click.stop="handleDrawAgain"
      >
        {{ drawAgainButtonText }}
      </button>
    </div>
    <p v-else-if="results.length && canClose && !isRecruitMode" class="result-hint">
      {{ instructionText }}
    </p>
    <p v-else-if="!results.length" class="result-empty">{{ emptyText }}</p>
  </div>
</template>

<style scoped>
  .result-stage {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 26px;
    background: rgba(0, 0, 0, 0.35);
    outline: none;
  }

  .result-stage.is-closing {
    pointer-events: none;
    animation: result-fade-out var(--result-close-fade, 220ms) ease forwards;
  }

  .quick-result {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 18px;
  }

  .result-rows {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 36px;
  }

  .result-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 28px;
  }

  /* ---- Envelopes ---- */
  .letter-card {
    --rarity: #5cbcff;
    --rarity-glow: rgba(92, 188, 255, 0);
    position: relative;
    width: calc(clamp(120px, 16vw, 200px) * var(--result-card-scale, 1));
    aspect-ratio: 4 / 3;
    opacity: 0;
    transform: scale(1.55) rotate(12deg);
    animation: letter-fly-in 0.42s ease-out forwards;
    animation-delay: calc(var(--index) * var(--result-fly-interval, 80ms));
  }

  .letter-card.is-gold {
    --rarity: #ffc928;
    --rarity-glow: rgba(255, 201, 40, 0.55);
  }

  .letter-card.is-pink {
    --rarity: #ff6fcf;
    --rarity-glow: rgba(255, 111, 207, 0.55);
  }

  .letter-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  /* ---- Student name plate ---- */
  .name-card {
    position: absolute;
    inset: 18% 10%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px 10px 6px;
    overflow: hidden;
    border-radius: 8px;
    background: linear-gradient(180deg, #ffffff 0%, #eef5fc 100%);
    color: var(--ba-ink-strong);
    font-size: clamp(16px, 2.1vw, 26px);
    font-weight: 800;
    letter-spacing: 0.04em;
    text-align: center;
    box-shadow:
      0 0 0 3px var(--rarity),
      0 0 0 5px rgba(255, 255, 255, 0.85),
      0 0 22px 4px var(--rarity-glow),
      0 8px 18px rgba(0, 0, 0, 0.28);
    opacity: 0;
    transform: translateY(12px) scale(0.96);
    animation: none;
  }

  /* Rarity band */
  .name-card::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    height: 5px;
    background: var(--rarity);
  }

  /* Hatched corner */
  .name-card::after {
    content: '';
    position: absolute;
    right: 0;
    bottom: 0;
    width: 50%;
    height: 55%;
    background: repeating-linear-gradient(
      -55deg,
      color-mix(in srgb, var(--rarity) 28%, transparent) 0 2px,
      transparent 2px 7px
    );
    -webkit-mask-image: linear-gradient(315deg, #000 0%, transparent 75%);
    mask-image: linear-gradient(315deg, #000 0%, transparent 75%);
    pointer-events: none;
  }

  .name-card span {
    position: relative;
    z-index: 1;
  }

  .name-card.is-reveal {
    animation: name-reveal 0.32s ease-out forwards;
    animation-delay: calc(var(--reveal-index) * var(--result-fly-interval, 80ms) + 0.08s);
  }

  /* ---- Hints ---- */
  .result-hint,
  .result-empty {
    display: flex;
    align-items: center;
    gap: 16px;
    margin: 0;
    color: #ffffff;
    font-weight: 700;
    letter-spacing: 0.2em;
    text-shadow: 0 2px 6px rgba(0, 0, 0, 0.45);
  }

  .result-hint {
    font-size: 16px;
    animation: result-hint-pulse 1.8s ease-in-out infinite;
  }

  .result-empty {
    font-size: 20px;
    opacity: 0.85;
  }

  .result-hint::before,
  .result-hint::after,
  .result-empty::before,
  .result-empty::after {
    content: '';
    width: 56px;
    height: 2px;
    border-radius: 1px;
    background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.9) 100%);
  }

  .result-hint::after,
  .result-empty::after {
    transform: scaleX(-1);
  }

  /* ---- Recruit mode actions ---- */
  .recruit-actions {
    display: flex;
    gap: 28px;
    margin-top: 18px;
    animation: actions-fade-in 0.3s ease both;
  }

  .result-action-btn {
    min-width: 210px;
  }

  @keyframes letter-fly-in {
    0% {
      opacity: 0;
      transform: scale(1.55) rotate(12deg) translateY(-16px);
    }
    100% {
      opacity: 1;
      transform: scale(1) rotate(12deg) translateY(0);
    }
  }

  @keyframes name-reveal {
    0% {
      opacity: 0;
      transform: translateY(12px) scale(0.96);
    }
    100% {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @keyframes result-fade-out {
    0% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }

  @keyframes result-hint-pulse {
    0%,
    100% {
      opacity: 0.55;
    }
    50% {
      opacity: 1;
    }
  }

  @keyframes actions-fade-in {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .result-hint {
      animation: none;
    }
  }
</style>
