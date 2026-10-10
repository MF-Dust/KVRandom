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
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        <span>按钮的样子～</span>
      </div>

      <div class="ba-form-item">
        <label class="ba-label">点击交互模式</label>
        <p class="ba-sublabel">
          选择点击悬浮按钮时的动作～极简模式只开启点名，完整模式会打开招募界面！
        </p>
        <n-radio-group
          v-model:value="config.floatingButton.mode"
          name="floating-button-mode"
          style="width: 100%"
        >
          <n-radio-button value="full" style="width: 50%; text-align: center"
            >完整模式 (招募)</n-radio-button
          >
          <n-radio-button value="simple" style="width: 50%; text-align: center"
            >极简模式 (点名)</n-radio-button
          >
        </n-radio-group>
      </div>

      <div class="ba-form-item">
        <label class="ba-label">按钮大小</label>
        <p class="ba-sublabel">基础是 50×50 px，100就是原始尺寸～范围 0-1000哦</p>
        <n-input-number
          v-model:value="config.floatingButton.sizePercent"
          :min="0"
          :max="1000"
          placeholder="100"
          style="width: 100%"
        />
      </div>

      <div class="ba-form-item">
        <label class="ba-label">按钮图标</label>
        <div class="ba-input-action-row">
          <n-input v-model:value="config.floatingButton.iconPath" placeholder="/image/random.svg" />
          <n-button secondary @click="pickAsset('iconPath', 'image')">选择</n-button>
        </div>
      </div>

      <div class="ba-form-item">
        <label class="ba-label">按钮背景</label>
        <n-input v-model:value="config.floatingButton.background" placeholder="CSS 颜色或渐变" />
      </div>

      <div class="ba-form-item">
        <label class="ba-label">按钮圆角</label>
        <div class="ba-slider-row">
          <n-slider
            v-model:value="config.floatingButton.borderRadiusPercent"
            :min="0"
            :max="50"
            :step="1"
          />
          <span class="ba-slider-value">{{ config.floatingButton.borderRadiusPercent }}%</span>
        </div>
      </div>

      <div class="ba-form-item">
        <label class="ba-label">透～明～度</label>
        <p class="ba-sublabel">数值越高越透明，0就是完全不透明～</p>
        <div class="ba-slider-row">
          <n-slider
            v-model:value="config.floatingButton.transparencyPercent"
            :min="0"
            :max="100"
            :step="1"
          />
          <span class="ba-slider-value">{{ config.floatingButton.transparencyPercent }}%</span>
        </div>
      </div>

      <div class="ba-toggle-row">
        <n-switch v-model:value="config.floatingButton.alwaysOnTop" />
        <span class="ba-toggle-label">永远在最上面！不会被其他窗口挡住哦～</span>
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
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        </svg>
        <span>点击反馈～</span>
      </div>

      <div class="ba-toggle-row">
        <n-switch v-model:value="config.floatingButton.clickSoundEnabled" />
        <span class="ba-toggle-label">点击悬浮按钮时播放音效</span>
      </div>

      <div class="ba-form-item">
        <label class="ba-label">点击音效路径</label>
        <div class="ba-input-action-row">
          <n-input
            v-model:value="config.floatingButton.clickSoundPath"
            placeholder="sound/button_click.wav"
          />
          <n-button secondary @click="pickAsset('clickSoundPath', 'audio')">选择</n-button>
        </div>
      </div>

      <div class="ba-form-item">
        <label class="ba-label">点击音效音量</label>
        <div class="ba-slider-row">
          <n-slider
            v-model:value="config.floatingButton.clickSoundVolume"
            :min="0"
            :max="1"
            :step="0.05"
          />
          <span class="ba-slider-value">
            {{ (config.floatingButton.clickSoundVolume * 100).toFixed(0) }}%
          </span>
        </div>
      </div>

      <div class="ba-form-item">
        <label class="ba-label">拖动判定阈值</label>
        <n-input-number
          v-model:value="config.floatingButton.dragThresholdPx"
          :min="0"
          :max="48"
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
          <circle cx="12" cy="12" r="10" />
          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
        </svg>
        <span>按钮位置～</span>
      </div>
      <p class="ba-card-desc">屏幕左上角是原点～退出时我会自动记住位置，留空就恢复默认哦！</p>
      <div class="ba-form-grid-2">
        <div class="ba-form-item">
          <label class="ba-label">位置 X</label>
          <n-input-number
            v-model:value="config.floatingButton.position.x"
            placeholder="自动"
            style="width: 100%"
          />
        </div>
        <div class="ba-form-item">
          <label class="ba-label">位置 Y</label>
          <n-input-number
            v-model:value="config.floatingButton.position.y"
            placeholder="自动"
            style="width: 100%"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import {
    NButton,
    NInput,
    NInputNumber,
    NSlider,
    NSwitch,
    NRadioGroup,
    NRadioButton,
  } from 'naive-ui'
  import { appApi } from '../../api/appApi'
  import { useConfigModel } from '../../composables/useConfigModel'

  const config = useConfigModel()

  const pickAsset = async (field: 'iconPath' | 'clickSoundPath', kind: 'image' | 'audio') => {
    const path = await appApi.pickAssetFile(kind)
    if (path) {
      config.value.floatingButton[field] = path
    }
  }
</script>
