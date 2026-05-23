<script setup lang="ts">
  import { usePickResultDialog } from '../composables/usePickResultDialog'

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
</script>

<template>
  <div
    class="result-stage"
    :class="{ 'is-closing': isClosing }"
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
            <img class="letter-img" :src="`/image/${item.rarity}.png`" alt="letter" />
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
            <img class="letter-img" :src="`/image/${item.rarity}.png`" alt="letter" />
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
      <button class="ba-action-btn ba-btn-confirm" @click.stop="handleConfirm">
        <div class="btn-content">
          <span class="btn-text">确认</span>
        </div>
      </button>
      <button
        v-if="results.length === 10"
        class="ba-action-btn ba-btn-again"
        @click.stop="handleDrawAgain"
      >
        <div class="btn-content">
          <span class="btn-text">再次抽取</span>
        </div>
      </button>
    </div>
    <p v-else-if="results.length && canClose && !isRecruitMode" class="result-hint">
      {{ instructionText }}
    </p>
    <p v-else-if="!results.length" class="result-empty">还没有点名结果呢～</p>
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
    animation: result-fade-out 220ms ease forwards;
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

  .letter-card {
    position: relative;
    width: clamp(120px, 16vw, 200px);
    aspect-ratio: 4 / 3;
    opacity: 0;
    transform: scale(2.5) rotate(15deg);
    animation: letter-fly-in 0.6s ease-out forwards;
    animation-delay: calc(var(--index) * 0.12s);
  }

  .letter-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    filter: drop-shadow(0 12px 24px rgba(0, 0, 0, 0.25));
  }

  .name-card {
    position: absolute;
    inset: 18% 10%;
    background: #ffffff;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 6px 10px;
    font-size: clamp(16px, 2.1vw, 26px);
    font-weight: 700;
    color: #1c2741;
    box-shadow: 0 10px 26px rgba(0, 0, 0, 0.25);
    opacity: 0;
    transform: translateY(12px) scale(0.96);
    animation: none;
    border: 3px solid transparent;
  }

  .letter-card.is-blue .name-card {
    border-color: #76c7ff;
    box-shadow:
      0 0 12px 2px rgba(118, 199, 255, 0.5),
      0 10px 26px rgba(0, 0, 0, 0.25);
  }

  .letter-card.is-gold .name-card {
    border-color: #ffd84d;
    box-shadow:
      0 0 12px 2px rgba(255, 216, 77, 0.5),
      0 10px 26px rgba(0, 0, 0, 0.25);
  }

  .letter-card.is-pink .name-card {
    border-color: #ff7ee2;
    box-shadow:
      0 0 12px 2px rgba(255, 126, 226, 0.5),
      0 10px 26px rgba(0, 0, 0, 0.25);
  }

  .name-card.is-reveal {
    animation: name-reveal 0.45s ease-out forwards;
    animation-delay: calc(var(--reveal-index) * 0.12s + 0.1s);
  }

  .result-hint {
    margin: 0;
    font-size: 16px;
    color: rgba(255, 255, 255, 0.8);
    letter-spacing: 2px;
  }

  .result-empty {
    margin: 0;
    font-size: 20px;
    color: rgba(255, 255, 255, 0.75);
    letter-spacing: 2px;
  }

  @keyframes letter-fly-in {
    0% {
      opacity: 0;
      transform: scale(2.5) rotate(15deg) translateY(-24px);
    }
    100% {
      opacity: 1;
      transform: scale(1) rotate(15deg) translateY(0);
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

  .recruit-actions {
    display: flex;
    gap: 30px;
    margin-top: 30px;
    animation: actions-fade-in 0.3s ease forwards;
  }

  .ba-action-btn {
    position: relative;
    min-width: 180px;
    height: 60px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transform: skewX(-12deg);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    transition:
      filter 0.2s,
      transform 0.1s;
  }

  .ba-action-btn::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 6px;
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.4);
    pointer-events: none;
  }

  .ba-action-btn .btn-content {
    transform: skewX(12deg);
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .ba-action-btn .btn-text {
    font-size: 24px;
    font-weight: 800;
    color: #1e334a;
    letter-spacing: 4px;
    margin-left: 4px;
  }

  .ba-action-btn .btn-sub {
    font-size: 14px;
    color: #fff;
    background: #344866;
    padding: 0px 8px;
    border-radius: 4px;
    margin-top: -2px;
    font-weight: 700;
  }

  .ba-btn-confirm {
    background: linear-gradient(180deg, #7ae2ff 0%, #4dbbff 100%);
  }

  .ba-btn-again {
    background: linear-gradient(180deg, #ffe066 0%, #ffc033 100%);
  }

  .ba-action-btn:active {
    transform: skewX(-12deg) scale(0.96);
    filter: brightness(0.9);
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
</style>
