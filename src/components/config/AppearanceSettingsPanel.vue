<template>
  <div class="ba-card-group">
    <div class="ba-card">
      <div class="ba-card-header">
        <svg
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="13.5" cy="6.5" r=".5" />
          <circle cx="17.5" cy="10.5" r=".5" />
          <circle cx="8.5" cy="7.5" r=".5" />
          <circle cx="6.5" cy="12.5" r=".5" />
          <path
            d="M12 2a10 10 0 0 0 0 20 2 2 0 0 0 2-2 1.8 1.8 0 0 0-1.8-1.8H11a8 8 0 1 1 8-8v1.2a1.8 1.8 0 0 0 1.8 1.8A2 2 0 0 0 22 11.2V10A10 10 0 0 0 12 2z"
          />
        </svg>
        <span>设置页外观～</span>
      </div>

      <div class="ba-form-grid-2">
        <div class="ba-form-item">
          <label class="ba-label">主题色</label>
          <n-color-picker v-model:value="config.appearance.themeColor" :show-alpha="false" />
        </div>
        <div class="ba-form-item">
          <label class="ba-label">强调色</label>
          <n-color-picker v-model:value="config.appearance.accentColor" :show-alpha="false" />
        </div>
      </div>

      <div class="ba-form-item">
        <label class="ba-label">页面背景</label>
        <n-input v-model:value="config.appearance.pageBackground" />
      </div>

      <div class="ba-form-grid-2">
        <div class="ba-form-item">
          <label class="ba-label">卡片圆角</label>
          <n-input-number
            v-model:value="config.appearance.cardRadiusPx"
            :min="0"
            :max="28"
            style="width: 100%"
          />
        </div>
        <div class="ba-toggle-row">
          <n-switch v-model:value="config.appearance.compactMode" />
          <span class="ba-toggle-label">紧凑模式</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { NColorPicker, NInput, NInputNumber, NSwitch } from 'naive-ui'
  import { useConfigModel } from '../../composables/useConfigModel'

  const config = useConfigModel()
</script>

<style scoped>
  .ba-card-group {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .ba-card {
    background: #ffffff;
    border: 1px solid rgba(18, 138, 250, 0.1);
    border-radius: var(--ba-card-radius, 12px);
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .ba-card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--ba-blue, #128afa);
    font-weight: 700;
    font-size: 15px;
  }

  .ba-form-grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }

  .ba-form-item {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .ba-label,
  .ba-toggle-label {
    font-size: 14px;
    font-weight: 600;
    color: #1a3a5c;
  }

  .ba-toggle-row {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  @media (max-width: 768px) {
    .ba-form-grid-2 {
      grid-template-columns: 1fr;
    }
  }
</style>
