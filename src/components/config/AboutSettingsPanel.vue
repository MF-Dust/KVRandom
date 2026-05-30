<template>
  <div class="ba-card-group">
    <div class="ba-card ba-card-about">
      <div class="ba-about-head">
        <div class="ba-app-mark">
          <img src="/image/tray.png" alt="KVRandom" />
        </div>
        <div class="ba-about-title">
          <h3>KVRandom</h3>
          <p>阿罗娜的点名工具～</p>
        </div>
      </div>

      <div class="ba-info-grid">
        <div class="ba-info-item">
          <span class="ba-info-label">当前版本</span>
          <span class="ba-info-value">{{ appVersion || '未知' }}</span>
        </div>
        <div class="ba-info-item">
          <span class="ba-info-label">运行权限</span>
          <span class="ba-info-value">{{ isAdmin ? '管理员' : '普通用户' }}</span>
        </div>
        <div class="ba-info-item">
          <span class="ba-info-label">调试模式</span>
          <span class="ba-info-value">{{ isDebugMode ? '开启' : '关闭' }}</span>
        </div>
      </div>
    </div>

    <div class="ba-card ba-card-muted">
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
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <span>商标 & 版权</span>
      </div>
      <div class="ba-copyright-text">
        <p>"蔚蓝档案"是上海星啸网络科技有限公司的注册商标，版权所有。</p>
        <p>「ブルーアーカイブ」は株式会社Yostarの登録商標です。著作権はすべて保有されています。</p>
        <p>
          "Blue Archive" is a registered trademark of NEXON Korea Corp. &amp; NEXON GAMES Co., Ltd.
          All rights reserved.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  defineProps({
    appVersion: {
      type: String,
      default: '',
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isDebugMode: {
      type: Boolean,
      default: false,
    },
  })
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

  .ba-card-about {
    background: linear-gradient(180deg, #f8fbff 0%, #ffffff 100%);
  }

  .ba-about-head {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .ba-app-mark {
    width: 54px;
    height: 54px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, var(--ba-blue, #128afa) 0%, #7fc8ff 100%);
    box-shadow: 0 8px 22px rgba(18, 138, 250, 0.2);
  }

  .ba-app-mark img {
    width: 34px;
    height: 34px;
    object-fit: contain;
  }

  .ba-about-title h3 {
    margin: 0;
    color: #0c2d4f;
    font-size: 22px;
    font-weight: 800;
    line-height: 1.2;
  }

  .ba-about-title p {
    margin: 4px 0 0;
    color: #5a7394;
    font-size: 13px;
  }

  .ba-info-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }

  .ba-info-item {
    border: 1px solid rgba(18, 138, 250, 0.1);
    border-radius: 10px;
    padding: 12px;
    background: #fbfdff;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .ba-info-label {
    color: #8ca3bf;
    font-size: 12px;
  }

  .ba-info-value {
    color: #1a3a5c;
    font-size: 14px;
    font-weight: 700;
  }

  .ba-card-muted {
    border-color: rgba(0, 0, 0, 0.06);
    background: #fafbfc;
  }

  .ba-card-muted .ba-card-header {
    color: #8ca3bf;
  }

  .ba-card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--ba-blue, #128afa);
    font-weight: 700;
    font-size: 15px;
  }

  .ba-copyright-text {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .ba-copyright-text p {
    margin: 0;
    font-size: 12px;
    color: #8ca3bf;
    line-height: 1.6;
  }

  @media (max-width: 768px) {
    .ba-info-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
