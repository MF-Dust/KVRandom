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
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
        </svg>
        <span>顶部资源显示值～</span>
      </div>

      <div class="ba-form-grid-3">
        <div class="ba-form-item">
          <label class="ba-label">AP</label>
          <n-input v-model:value="config.recruitConfig.apDisplay" />
        </div>
        <div class="ba-form-item">
          <label class="ba-label">信用积分</label>
          <n-input v-model:value="config.recruitConfig.creditDisplay" />
        </div>
        <div class="ba-form-item">
          <label class="ba-label">青辉石</label>
          <n-input v-model:value="config.recruitConfig.pyroxeneDisplay" />
        </div>
        <div class="ba-form-item">
          <label class="ba-label">10次券</label>
          <n-input v-model:value="config.recruitConfig.recruitTicket10Display" />
        </div>
        <div class="ba-form-item">
          <label class="ba-label">1次券</label>
          <n-input v-model:value="config.recruitConfig.recruitTicket1Display" />
        </div>
        <div class="ba-form-item">
          <label class="ba-label">自选券</label>
          <n-input v-model:value="config.recruitConfig.selectTicketDisplay" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { NButton, NInput, NSwitch } from 'naive-ui'
  import { appApi } from '../../api/appApi'

  const props = defineProps({
    config: {
      type: Object,
      required: true,
    },
  })

  const pickVideo = async () => {
    const path = await appApi.pickAssetFile('video')
    if (path) {
      props.config.recruitConfig.defaultVideoPath = path
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

  .ba-form-item {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .ba-input-action-row {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 8px;
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
    .ba-form-grid-2,
    .ba-form-grid-3,
    .ba-input-action-row {
      grid-template-columns: 1fr;
    }
  }
</style>
