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
          <path d="M12 2 2 7l10 5 10-5-10-5z" />
          <path d="m2 17 10 5 10-5" />
          <path d="m2 12 10 5 10-5" />
        </svg>
        <span>招募界面～</span>
      </div>

      <div class="ba-form-grid-2">
        <div class="ba-form-item">
          <label class="ba-label">顶部标题</label>
          <n-input v-model:value="config.recruitConfig.titleText" />
        </div>
        <div class="ba-toggle-row">
          <n-switch v-model:value="config.recruitConfig.showCurrencyBar" />
          <span class="ba-toggle-label">显示顶部资源栏</span>
        </div>
      </div>

      <div class="ba-form-item">
        <label class="ba-label">默认招募视频</label>
        <div class="ba-input-action-row">
          <n-input v-model:value="config.recruitConfig.defaultVideoPath" />
          <n-button secondary @click="pickVideo">选择</n-button>
        </div>
      </div>

      <div class="ba-form-grid-2">
        <div class="ba-form-item">
          <label class="ba-label">跳过视频提示</label>
          <n-input v-model:value="config.recruitConfig.skipHintText" />
        </div>
        <div class="ba-toggle-row">
          <n-switch v-model:value="config.recruitConfig.showResultOverlay" />
          <span class="ba-toggle-label">招募页显示结果遮罩</span>
        </div>
      </div>

      <div class="ba-form-item">
        <div class="ba-toggle-row">
          <n-switch v-model:value="config.recruitConfig.autoSkipVideo" />
          <span class="ba-toggle-label">自动跳过招募视频</span>
        </div>
        <p class="ba-hint-text">开启后，点击招募按钮时将自动跳过视频播放</p>
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
          <path d="M21 15V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9" />
          <path d="M3 15h18v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3z" />
        </svg>
        <span>招募页文案～</span>
      </div>

      <div class="ba-form-grid-2">
        <div class="ba-form-item">
          <label class="ba-label">可选成员按钮</label>
          <n-input v-model:value="config.recruitConfig.selectableMembersText" />
        </div>
        <div class="ba-form-item">
          <label class="ba-label">成员一览标题</label>
          <n-input v-model:value="config.recruitConfig.ratesTitleText" />
        </div>
        <div class="ba-form-item">
          <label class="ba-label">选择弹窗标题</label>
          <n-input v-model:value="config.recruitConfig.selectionTitleText" />
        </div>
        <div class="ba-form-item">
          <label class="ba-label">补给弹窗标题</label>
          <n-input v-model:value="config.recruitConfig.replenishTitleText" />
        </div>
        <div class="ba-form-item">
          <label class="ba-label">补给取消按钮</label>
          <n-input v-model:value="config.recruitConfig.replenishCancelText" />
        </div>
        <div class="ba-form-item">
          <label class="ba-label">补给确认按钮</label>
          <n-input v-model:value="config.recruitConfig.replenishConfirmText" />
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
  import { NButton, NInput, NSwitch } from 'naive-ui'
  import { appApi } from '../../api/appApi'
  import { useConfigModel } from '../../composables/useConfigModel'

  const config = useConfigModel()

  const pickVideo = async () => {
    const path = await appApi.pickAssetFile('video')
    if (path) {
      config.value.recruitConfig.defaultVideoPath = path
    }
  }
</script>
