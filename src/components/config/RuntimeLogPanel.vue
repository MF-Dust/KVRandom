<template>
  <div class="ba-log-panel" :class="{ collapsed: !expanded }">
    <button type="button" class="ba-log-header" @click="expanded = !expanded">
      <div class="ba-log-title-row">
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="4 17 10 11 4 5" />
          <line x1="12" y1="19" x2="20" y2="19" />
        </svg>
        <span class="ba-log-title">运行日志～</span>
        <n-tag v-if="isDebugMode" type="info" size="small" round>Dev</n-tag>
        <n-tag v-if="isAdmin" type="warning" size="small" round>管理员模式</n-tag>
        <n-tag size="small" round :bordered="false">v{{ appVersion }}</n-tag>
      </div>
      <svg
        class="ba-log-chevron"
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>
    <transition name="ba-log-slide">
      <div v-if="expanded" class="ba-log-body">
        <div class="ba-log-list" role="log" aria-live="polite">
          <div v-if="logs.length === 0" class="ba-log-empty">
            <svg
              viewBox="0 0 24 24"
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              style="opacity: 0.4"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>还没有新日志呢～</span>
          </div>
          <div
            v-for="item in logs"
            :key="item.id"
            class="ba-log-item"
            :class="`ba-log-${item.level}`"
          >
            <span class="ba-log-time">{{ item.time }}</span>
            <span class="ba-log-text">{{ item.text }}</span>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import type { PropType } from 'vue'
  import { NTag } from 'naive-ui'

  type RuntimeLogItem = {
    id: number | string
    level: string
    time: string
    text: string
  }

  defineProps({
    logs: {
      type: Array as PropType<RuntimeLogItem[]>,
      required: true,
    },
    isDebugMode: {
      type: Boolean,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      required: true,
    },
    appVersion: {
      type: String,
      required: true,
    },
  })

  const expanded = ref(false)
</script>

<style scoped>
  .ba-log-panel {
    position: relative;
    flex-shrink: 0;
    border-top: 1px solid var(--ba-line);
    background: rgba(255, 255, 255, 0.94);
    box-shadow: 0 -4px 16px rgba(16, 52, 96, 0.06);
  }

  .ba-log-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 9px 20px;
    border: none;
    background: transparent;
    font-family: inherit;
    cursor: pointer;
    transition: background 0.2s;
  }

  .ba-log-header:hover {
    background: var(--ba-blue-soft);
  }

  .ba-log-header:focus-visible {
    outline: 2px solid var(--ba-blue);
    outline-offset: -2px;
  }

  .ba-log-title-row {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--ba-ink);
  }

  .ba-log-title-row > svg {
    width: 22px;
    height: 22px;
    padding: 4px;
    border-radius: 5px;
    background: var(--ba-fill-navy);
    color: #ffffff;
  }

  .ba-log-title {
    color: var(--ba-ink-strong);
    font-size: 14px;
    font-weight: 800;
  }

  .ba-log-chevron {
    color: var(--ba-subtle);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .ba-log-panel:not(.collapsed) .ba-log-chevron {
    transform: rotate(180deg);
  }

  .ba-log-body {
    max-height: 200px;
    overflow: hidden;
  }

  .ba-log-list {
    display: flex;
    flex-direction: column-reverse;
    gap: 6px;
    max-height: 186px;
    padding: 0 16px 14px;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: #bcd4ec transparent;
  }

  .ba-log-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 16px;
    border: 1px dashed var(--ba-line);
    border-radius: var(--ba-radius-sm);
    background: var(--ba-surface-soft);
    color: var(--ba-subtle);
    font-size: 13px;
  }

  .ba-log-item {
    display: grid;
    grid-template-columns: 64px 1fr;
    gap: 10px;
    padding: 7px 12px;
    border: 1px solid var(--ba-line-soft);
    border-left: 4px solid #c9d7e6;
    border-radius: var(--ba-radius-sm);
    background: #ffffff;
    font-size: 12px;
  }

  .ba-log-item.ba-log-info {
    border-left-color: var(--ba-blue);
  }

  .ba-log-item.ba-log-success {
    border-left-color: var(--ba-green);
    background: #f4fdf8;
  }

  .ba-log-item.ba-log-error {
    border-left-color: var(--ba-red);
    background: #fff6f8;
  }

  .ba-log-time {
    color: var(--ba-subtle);
    font-family: var(--ba-font-num);
    font-size: 11px;
    font-variant-numeric: tabular-nums;
  }

  .ba-log-text {
    color: var(--ba-ink);
    word-break: break-word;
    overflow-wrap: anywhere;
  }

  /* transition */
  .ba-log-slide-enter-active,
  .ba-log-slide-leave-active {
    transition:
      max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1),
      opacity 0.25s;
  }

  .ba-log-slide-enter-from,
  .ba-log-slide-leave-to {
    max-height: 0;
    opacity: 0;
  }

  .ba-log-slide-enter-to,
  .ba-log-slide-leave-from {
    max-height: 200px;
    opacity: 1;
  }
</style>
