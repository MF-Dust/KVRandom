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
          <polygon
            points="12 2 15 8.5 22 9.2 17 14.2 18.2 21 12 17.7 5.8 21 7 14.2 2 9.2 9 8.5 12 2"
          />
        </svg>
        <span>结果音效～</span>
      </div>

      <div class="ba-toggle-row">
        <n-switch v-model:value="config.pickResultDialog.defaultPlayGachaSound" />
        <div class="ba-toggle-content">
          <span class="ba-toggle-label">点名时播放结果音效～</span>
          <span class="ba-toggle-hint">保存后会影响点名结果窗口和招募结果遮罩。</span>
        </div>
      </div>

      <div class="ba-form-item">
        <label class="ba-label">音效路径</label>
        <div class="ba-input-action-row">
          <n-input v-model:value="config.pickResultDialog.gachaSoundPath" />
          <n-button secondary @click="pickAsset('gachaSoundPath', 'audio')">选择</n-button>
        </div>
      </div>

      <div class="ba-form-item">
        <label class="ba-label">音效音量</label>
        <div class="ba-slider-row">
          <n-slider
            v-model:value="config.pickResultDialog.gachaSoundVolume"
            :min="0"
            :max="1"
            :step="0.05"
            style="flex: 1"
          />
          <span class="ba-slider-value">
            {{ (config.pickResultDialog.gachaSoundVolume * 100).toFixed(0) }}%
          </span>
        </div>
      </div>
    </div>

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
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="m3 7 9 6 9-6" />
        </svg>
        <span>信封与画面～</span>
      </div>

      <div class="ba-form-grid-3">
        <div class="ba-form-item">
          <label class="ba-label">蓝色信封</label>
          <div class="ba-input-action-row">
            <n-input v-model:value="config.pickResultDialog.blueEnvelopeImage" />
            <n-button secondary @click="pickAsset('blueEnvelopeImage', 'image')">选择</n-button>
          </div>
        </div>
        <div class="ba-form-item">
          <label class="ba-label">金色信封</label>
          <div class="ba-input-action-row">
            <n-input v-model:value="config.pickResultDialog.goldEnvelopeImage" />
            <n-button secondary @click="pickAsset('goldEnvelopeImage', 'image')">选择</n-button>
          </div>
        </div>
        <div class="ba-form-item">
          <label class="ba-label">粉色信封</label>
          <div class="ba-input-action-row">
            <n-input v-model:value="config.pickResultDialog.pinkEnvelopeImage" />
            <n-button secondary @click="pickAsset('pinkEnvelopeImage', 'image')">选择</n-button>
          </div>
        </div>
      </div>

      <div class="ba-form-grid-2">
        <div class="ba-form-item">
          <label class="ba-label">背景变暗</label>
          <n-slider
            v-model:value="config.pickResultDialog.backgroundDarknessPercent"
            :min="0"
            :max="100"
            :step="1"
          />
          <span class="ba-slider-value"
            >{{ config.pickResultDialog.backgroundDarknessPercent }}%</span
          >
        </div>
        <div class="ba-form-item">
          <label class="ba-label">卡片尺寸</label>
          <n-slider
            v-model:value="config.pickResultDialog.cardSizePercent"
            :min="50"
            :max="200"
            :step="5"
          />
          <span class="ba-slider-value">{{ config.pickResultDialog.cardSizePercent }}%</span>
        </div>
      </div>
    </div>

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
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        <span>动画时序与文案～</span>
      </div>

      <div class="ba-form-grid-3">
        <div class="ba-form-item">
          <label class="ba-label">飞入间隔 (ms)</label>
          <n-input-number
            v-model:value="config.pickResultDialog.flyIntervalMs"
            :min="0"
            :max="1000"
          />
        </div>
        <div class="ba-form-item">
          <label class="ba-label">揭示延迟 (ms)</label>
          <n-input-number
            v-model:value="config.pickResultDialog.revealDelayMs"
            :min="0"
            :max="5000"
          />
        </div>
        <div class="ba-form-item">
          <label class="ba-label">关闭淡出 (ms)</label>
          <n-input-number
            v-model:value="config.pickResultDialog.closeFadeMs"
            :min="0"
            :max="3000"
          />
        </div>
      </div>

      <div class="ba-form-grid-2">
        <div class="ba-form-item">
          <label class="ba-label">关闭提示</label>
          <n-input v-model:value="config.pickResultDialog.closeHintText" />
        </div>
        <div class="ba-form-item">
          <label class="ba-label">空结果提示</label>
          <n-input v-model:value="config.pickResultDialog.emptyText" />
        </div>
        <div class="ba-form-item">
          <label class="ba-label">确认按钮</label>
          <n-input v-model:value="config.pickResultDialog.confirmButtonText" />
        </div>
        <div class="ba-form-item">
          <label class="ba-label">再次抽取按钮</label>
          <n-input v-model:value="config.pickResultDialog.drawAgainButtonText" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { NButton, NInput, NInputNumber, NSlider, NSwitch } from 'naive-ui'
  import { appApi } from '../../api/appApi'
  import { useConfigModel } from '../../composables/useConfigModel'

  type PickResultAssetField =
    | 'gachaSoundPath'
    | 'blueEnvelopeImage'
    | 'goldEnvelopeImage'
    | 'pinkEnvelopeImage'

  const config = useConfigModel()

  const pickAsset = async (field: PickResultAssetField, kind: 'image' | 'audio') => {
    const path = await appApi.pickAssetFile(kind)
    if (path) {
      config.value.pickResultDialog[field] = path
    }
  }
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

  .ba-toggle-row {
    display: flex;
    align-items: flex-start;
    gap: 10px;
  }

  .ba-toggle-content {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .ba-toggle-label,
  .ba-label {
    font-size: 14px;
    color: #1a3a5c;
    font-weight: 600;
  }

  .ba-toggle-hint {
    font-size: 12px;
    color: #8ca3bf;
  }

  .ba-form-item {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .ba-slider-row,
  .ba-input-action-row {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    gap: 8px;
  }

  .ba-slider-value {
    font-size: 13px;
    font-weight: 700;
    color: var(--ba-blue, #128afa);
    text-align: right;
  }

  .ba-form-grid-2,
  .ba-form-grid-3 {
    display: grid;
    gap: 14px;
  }

  .ba-form-grid-2 {
    grid-template-columns: 1fr 1fr;
  }

  .ba-form-grid-3 {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 768px) {
    .ba-form-grid-2,
    .ba-form-grid-3,
    .ba-slider-row,
    .ba-input-action-row {
      grid-template-columns: 1fr;
    }
  }
</style>
