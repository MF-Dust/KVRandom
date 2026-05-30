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
            points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
          />
        </svg>
        <span>音效 & 动画～</span>
      </div>

      <div class="ba-toggle-row">
        <n-switch v-model:value="config.pickCountDialog.defaultPlayMusic" />
        <div class="ba-toggle-content">
          <span class="ba-toggle-label">点名时播放BGM～</span>
          <span class="ba-toggle-hint"
            >如果老师在上课时用，记得确认一下环境哦～不要社死了！每次会随机播放超喜庆的BGM～</span
          >
        </div>
      </div>

      <div class="ba-toggle-row">
        <n-switch v-model:value="config.pickCountDialog.allowMusicToggle" />
        <div class="ba-toggle-content">
          <span class="ba-toggle-label">弹窗里允许临时切换BGM～</span>
          <span class="ba-toggle-hint">关闭后，点名窗口不显示 BGM 勾选项，按默认开关执行。</span>
        </div>
      </div>

      <div class="ba-form-item">
        <label class="ba-label">BGM 音量～</label>
        <div class="ba-slider-row">
          <n-slider
            v-model:value="config.pickCountDialog.bgmVolume"
            :min="0"
            :max="1"
            :step="0.05"
            style="flex: 1"
          />
          <span class="ba-slider-value"
            >{{ (config.pickCountDialog.bgmVolume * 100).toFixed(0) }}%</span
          >
        </div>
      </div>

      <div class="ba-form-item">
        <label class="ba-label">BGM 资源列表～</label>
        <div
          v-for="(_path, index) in config.pickCountDialog.bgmPaths"
          :key="`bgm-${index}`"
          class="ba-input-action-row"
        >
          <n-input v-model:value="config.pickCountDialog.bgmPaths[index]" />
          <n-button secondary @click="pickBgm(Number(index))">选择</n-button>
          <n-button tertiary type="error" @click="removeBgm(Number(index))">删除</n-button>
        </div>
        <n-button secondary size="small" @click="addBgm">添加 BGM</n-button>
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
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
        <span>画面效果～</span>
      </div>

      <div class="ba-form-item">
        <label class="ba-label">背景暗下来多少～</label>
        <div class="ba-slider-row">
          <n-slider
            v-model:value="config.pickCountDialog.backgroundDarknessPercent"
            :min="0"
            :max="100"
            :step="1"
            style="flex: 1"
          />
          <span class="ba-slider-value"
            >{{ config.pickCountDialog.backgroundDarknessPercent }}%</span
          >
        </div>
      </div>

      <div class="ba-form-item">
        <label class="ba-label">每次默认点名几人～</label>
        <p class="ba-sublabel">
          范围 {{ MIN_PICK_COUNT }} - {{ MAX_PICK_COUNT }}，老师按需来就好啦～
        </p>
        <n-input-number
          v-model:value="config.pickCountDialog.defaultCount"
          :min="MIN_PICK_COUNT"
          :max="MAX_PICK_COUNT"
          style="width: 100%"
        />
      </div>

      <div class="ba-form-item">
        <label class="ba-label">面板背景</label>
        <n-input v-model:value="config.pickCountDialog.panelBackground" />
      </div>

      <div class="ba-form-item">
        <label class="ba-label">退出动画时长 (ms)</label>
        <n-input-number
          v-model:value="config.pickCountDialog.exitAnimationMs"
          :min="0"
          :max="3000"
          style="width: 100%"
        />
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
          <path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
        </svg>
        <span>点名窗口文案～</span>
      </div>

      <div class="ba-form-grid-2">
        <div class="ba-form-item">
          <label class="ba-label">标题</label>
          <n-input v-model:value="config.pickCountDialog.titleText" />
        </div>
        <div class="ba-form-item">
          <label class="ba-label">范围提示</label>
          <n-input v-model:value="config.pickCountDialog.rangeHintText" />
        </div>
        <div class="ba-form-item">
          <label class="ba-label">最少按钮</label>
          <n-input v-model:value="config.pickCountDialog.minButtonText" />
        </div>
        <div class="ba-form-item">
          <label class="ba-label">最多按钮</label>
          <n-input v-model:value="config.pickCountDialog.maxButtonText" />
        </div>
        <div class="ba-form-item">
          <label class="ba-label">取消按钮</label>
          <n-input v-model:value="config.pickCountDialog.cancelButtonText" />
        </div>
        <div class="ba-form-item">
          <label class="ba-label">确认按钮</label>
          <n-input v-model:value="config.pickCountDialog.confirmButtonText" />
        </div>
      </div>
      <div class="ba-form-item">
        <label class="ba-label">BGM 勾选文案</label>
        <n-input v-model:value="config.pickCountDialog.musicLabelText" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { NButton, NInput, NInputNumber, NSlider, NSwitch } from 'naive-ui'
  import { MAX_PICK_COUNT, MIN_PICK_COUNT } from '../../configDefaults'
  import { appApi } from '../../api/appApi'

  const props = defineProps({
    config: {
      type: Object,
      required: true,
    },
  })

  const addBgm = () => {
    props.config.pickCountDialog.bgmPaths.push('sound/bgm.mp3')
  }

  const removeBgm = (index: number) => {
    props.config.pickCountDialog.bgmPaths.splice(index, 1)
  }

  const pickBgm = async (index: number) => {
    const path = await appApi.pickAssetFile('audio')
    if (path) {
      props.config.pickCountDialog.bgmPaths[index] = path
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
    border-radius: 12px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    transition:
      box-shadow 0.25s,
      transform 0.25s;
  }

  .ba-card:hover {
    box-shadow: 0 4px 20px rgba(18, 138, 250, 0.08);
    transform: translateY(-1px);
  }

  .ba-card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #128afa;
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

  .ba-toggle-label {
    font-size: 14px;
    color: #1a3a5c;
    font-weight: 500;
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

  .ba-label {
    font-size: 14px;
    font-weight: 600;
    color: #1a3a5c;
  }

  .ba-sublabel {
    margin: 0;
    font-size: 12px;
    color: #8ca3bf;
  }

  .ba-slider-row {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .ba-slider-value {
    font-size: 13px;
    font-weight: 700;
    color: #128afa;
    min-width: 40px;
    text-align: right;
  }

  .ba-input-action-row {
    display: grid;
    grid-template-columns: 1fr auto auto;
    gap: 8px;
  }

  .ba-form-grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  @media (max-width: 768px) {
    .ba-input-action-row,
    .ba-form-grid-2 {
      grid-template-columns: 1fr;
    }
  }
</style>
