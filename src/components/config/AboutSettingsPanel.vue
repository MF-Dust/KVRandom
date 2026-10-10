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
  .ba-card-about {
    background:
      radial-gradient(circle at 100% 0%, var(--ba-blue-soft) 0%, transparent 45%),
      linear-gradient(180deg, #f7fbff 0%, #ffffff 100%);
  }

  .ba-about-head {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .ba-app-mark {
    display: flex;
    flex: none;
    align-items: center;
    justify-content: center;
    width: 58px;
    height: 58px;
    border: 3px solid #ffffff;
    border-radius: 14px;
    background: linear-gradient(135deg, var(--ba-blue-soft) 0%, #ffffff 100%);
    box-shadow:
      0 0 0 1px var(--ba-line),
      0 8px 20px var(--ba-blue-glow);
  }

  .ba-app-mark img {
    width: 40px;
    height: 40px;
    object-fit: contain;
  }

  .ba-about-title h3 {
    margin: 0;
    color: var(--ba-ink-strong);
    font-size: 22px;
    font-weight: 900;
    line-height: 1.2;
    letter-spacing: 0.02em;
  }

  .ba-about-title p {
    margin: 4px 0 0;
    color: var(--ba-muted);
    font-size: 13px;
  }

  .ba-info-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }

  .ba-info-item {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 12px 14px;
    overflow: hidden;
    border: 1px solid var(--ba-line);
    border-radius: var(--ba-radius-sm);
    background: var(--ba-surface);
  }

  .ba-info-item::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 4px;
    background: var(--ba-blue);
  }

  .ba-info-label {
    color: var(--ba-subtle);
    font-size: 12px;
    font-weight: 700;
  }

  .ba-info-value {
    color: var(--ba-ink-strong);
    font-family: var(--ba-font-num);
    font-size: 15px;
    font-weight: 700;
  }

  .ba-copyright-text {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .ba-copyright-text p {
    margin: 0;
    color: var(--ba-subtle);
    font-size: 12px;
    line-height: 1.6;
  }

  @media (max-width: 768px) {
    .ba-info-grid {
      grid-template-columns: minmax(0, 1fr);
    }
  }
</style>
