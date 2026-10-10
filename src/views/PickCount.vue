<script setup lang="ts">
  import { usePickCountDialog } from '../composables/usePickCountDialog'

  const {
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
  } = usePickCountDialog()
</script>

<template>
  <div class="pick-overlay" :class="{ 'is-leaving': isLeaving }" :style="overlayStyle">
    <!-- inert while leaving: no further input, but keeps the visual state during the exit -->
    <section
      class="pick-panel ba-dialog"
      :style="panelStyle"
      :inert="isLeaving"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pick-title"
    >
      <header class="ba-dialog__header">
        <h1 id="pick-title" class="ba-dialog__title pick-title">{{ titleText }}</h1>
      </header>

      <div class="pick-body">
        <div class="pick-counter-row">
          <button
            type="button"
            class="ba-btn ba-btn--sm pick-range-btn"
            :disabled="!canDecrease"
            @click="setMinCount"
          >
            {{ minButtonText }}
          </button>
          <button
            type="button"
            class="ba-btn ba-btn--blue pick-step-btn"
            :disabled="!canDecrease"
            aria-label="减少～"
            @click="decreaseCount"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
          <div class="pick-count-box" aria-live="polite">
            <span class="pick-count-value">{{ count }}</span>
          </div>
          <button
            type="button"
            class="ba-btn ba-btn--blue pick-step-btn"
            :disabled="!canIncrease"
            aria-label="增加！"
            @click="increaseCount"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12" />
              <line x1="12" y1="5" x2="12" y2="19" />
            </svg>
          </button>
          <button
            type="button"
            class="ba-btn ba-btn--sm pick-range-btn"
            :disabled="!canIncrease"
            @click="setMaxCount"
          >
            {{ maxButtonText }}
          </button>
        </div>
        <p class="pick-range-hint">{{ rangeHintText }}</p>
      </div>

      <footer class="pick-footer">
        <div class="pick-actions">
          <button type="button" class="ba-btn ba-btn--lg pick-action-btn" @click="handleCancel">
            {{ cancelButtonText }}
          </button>
          <button
            type="button"
            class="ba-btn ba-btn--lg ba-btn--yellow ba-btn--shine pick-action-btn"
            @click="handleConfirm"
          >
            {{ confirmButtonText }}
          </button>
        </div>

        <label v-if="allowMusicToggle" class="pick-music-row">
          <input v-model="playMusic" class="ba-checkbox" type="checkbox" />
          <span>{{ musicLabelText }}</span>
        </label>
      </footer>
    </section>
  </div>
</template>

<style scoped>
  .pick-overlay {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    animation: pick-overlay-fade-in 0.4s ease forwards;
  }

  .pick-overlay.is-leaving {
    animation: pick-overlay-fade-out var(--pick-exit-ms, 400ms) ease forwards;
  }

  .pick-panel {
    width: min(600px, 92vw);
    background: var(--ba-surface-tint);
    opacity: 0;
    transform: translateY(18px);
    animation: pick-panel-fly-fade-in 0.4s ease-out forwards;
  }

  .pick-overlay.is-leaving .pick-panel {
    animation: pick-panel-fly-fade-out var(--pick-exit-ms, 400ms) ease-in forwards;
  }

  .pick-title {
    font-size: 22px;
    letter-spacing: 0.1em;
  }

  /* ---- Counter ---- */
  .pick-body {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 28px 26px 6px;
  }

  .pick-counter-row {
    display: grid;
    grid-template-columns: auto auto minmax(120px, 1fr) auto auto;
    align-items: center;
    gap: 8px;
    width: 100%;
  }

  .pick-range-btn {
    min-width: 72px;
    padding: 0 14px;
  }

  .pick-step-btn {
    width: 66px;
    min-height: 66px;
    padding: 0;
  }

  .pick-step-btn svg {
    width: 28px;
    height: 28px;
    fill: none;
    stroke: currentColor;
    stroke-width: 3.2;
    stroke-linecap: round;
  }

  .pick-count-box {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 78px;
    overflow: hidden;
    border-radius: var(--ba-radius-sm);
    background: linear-gradient(180deg, #24476f 0%, var(--ba-ink-strong) 100%);
    box-shadow:
      inset 0 2px 8px rgba(0, 0, 0, 0.4),
      inset 0 0 0 1px rgba(140, 210, 255, 0.28),
      0 1px 0 #ffffff;
  }

  .pick-count-box::before {
    content: '';
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      -55deg,
      rgba(255, 255, 255, 0.05) 0 2px,
      transparent 2px 9px
    );
  }

  .pick-count-value {
    position: relative;
    color: #ffffff;
    font-family: var(--ba-font-num);
    font-size: 50px;
    font-weight: 700;
    line-height: 1;
    font-variant-numeric: tabular-nums;
    text-shadow: 0 0 14px rgba(76, 198, 255, 0.65);
  }

  .pick-range-hint {
    margin: 0;
    color: var(--ba-muted);
    font-size: 13px;
    letter-spacing: 0.04em;
    text-align: center;
  }

  /* ---- Actions ---- */
  .pick-footer {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    padding: 16px 26px 20px;
    border-top: 1px solid rgba(16, 52, 96, 0.08);
  }

  .pick-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 18px;
    width: 100%;
  }

  .pick-action-btn {
    width: 100%;
    padding: 0 16px;
  }

  .pick-music-row {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    color: var(--ba-ink);
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0.04em;
    cursor: pointer;
  }

  @keyframes pick-overlay-fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes pick-overlay-fade-out {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }

  @keyframes pick-panel-fly-fade-in {
    from {
      opacity: 0;
      transform: translateY(18px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes pick-panel-fly-fade-out {
    from {
      opacity: 1;
      transform: translateY(0);
    }
    to {
      opacity: 0;
      transform: translateY(22px);
    }
  }
</style>
