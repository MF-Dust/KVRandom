<template>
  <div class="ba-card-group">
    <p class="ba-section-hint">
      老师请注意哦～这里的设置会影响程序的基础运行，一般保持默认就可以啦
    </p>

    <!-- 管理员置顶 -->
    <div class="ba-card ba-card-amber">
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
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        <span>管理员增强～</span>
      </div>
      <div class="ba-toggle-row">
        <n-switch v-model:value="config.webConfig.adminTopmostEnabled" />
        <div class="ba-toggle-content">
          <span class="ba-toggle-label">启动时申请管理员权限～</span>
          <span class="ba-toggle-hint"
            >开启后会弹出 UAC 提示，这样悬浮按钮的置顶效果会更强哦～</span
          >
        </div>
      </div>
      <n-button type="warning" secondary @click="$emit('request-admin-elevation')">
        <template #icon>
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
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </template>
        用管理员身份重启～
      </n-button>
    </div>

    <!-- 开机启动 -->
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
        <span>开机自动启动～</span>
      </div>
      <div class="ba-form-item">
        <label class="ba-label">程序路径（exe）</label>
        <n-input
          v-model:value="config.webConfig.adminAutoStartPath"
          placeholder="例如：C:\Program Files\KVRandom\kvrandom.exe"
        />
      </div>
      <div class="ba-form-item">
        <label class="ba-label">任务名称</label>
        <n-input v-model:value="config.webConfig.adminAutoStartTaskName" />
      </div>
      <p class="ba-card-desc">
        点击后我会帮老师创建或更新计划任务，登录系统时就会以管理员权限自动启动哦
      </p>
      <n-button type="primary" secondary @click="$emit('create-admin-startup-task')">
        <template #icon>
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
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </template>
        创建 / 更新开机任务！
      </n-button>
    </div>

    <!-- 检查更新 -->
    <div class="ba-card ba-card-purple">
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
          <polyline points="23 4 23 10 17 10" />
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
        </svg>
        <span>检查更新～</span>
      </div>
      <div class="ba-update-row">
        <n-button type="info" :loading="updateState.loading" @click="$emit('check-update')">
          {{ updateState.loading ? '正在检查中...' : '检查最新版本～' }}
        </n-button>
        <span
          v-if="updateState.title"
          class="ba-update-status"
          :class="`ba-status-${updateState.status}`"
        >
          {{ updateState.title }}
        </span>
      </div>
      <div v-if="updateState.detail" class="ba-update-detail">
        {{ updateState.detail }}
      </div>
      <div v-if="updateState.commitUrl || updateState.releaseUrl" class="ba-update-links">
        <n-button
          v-if="updateState.commitUrl"
          text
          tag="a"
          :href="updateState.commitUrl"
          target="_blank"
          type="primary"
          size="small"
        >
          看看这次更新～
        </n-button>
        <n-button
          v-if="updateState.releaseUrl"
          text
          tag="a"
          :href="updateState.releaseUrl"
          target="_blank"
          type="primary"
          size="small"
        >
          去发布页面看看～
        </n-button>
      </div>
    </div>

    <!-- 字体设置 -->
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
          <polyline points="4 7 4 4 20 4 20 7" />
          <line x1="9" y1="20" x2="15" y2="20" />
          <line x1="12" y1="4" x2="12" y2="20" />
        </svg>
        <span>字体设置～</span>
      </div>
      <div class="ba-form-item">
        <label class="ba-label">选择或者自定义输入字体家族 (Font Family)</label>
        <n-select
          v-model:value="config.fontFamily"
          :options="fontOptions"
          placeholder="请选择或直接输入字体家族名称..."
          filterable
          tag
        />
        <p class="ba-card-desc">
          老师可以选择系统内置的常用字体，或者手动输入您电脑里已安装的任何字体名称（如
          “方正兰亭圆_GBK”、“微软雅黑” 等）哦！留空则使用默认字体。
        </p>
        <div class="ba-font-preview" :style="{ fontFamily: config.fontFamily || undefined }">
          <span class="ba-preview-label">字体效果预览：</span>
          <span class="ba-preview-text">老师，您觉得现在的字体效果怎么样？(0123456789 ABCabc)</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { NButton, NInput, NSwitch, NSelect } from 'naive-ui'
  import { appApi } from '../../api/appApi'

  defineProps({
    config: {
      type: Object,
      required: true,
    },
    updateState: {
      type: Object,
      required: true,
    },
  })

  defineEmits(['request-admin-elevation', 'create-admin-startup-task', 'check-update'])

  const fontOptions = ref<{ label: string; value: string }[]>([
    { label: '系统默认字体', value: '' },
    { label: '微软雅黑 (Microsoft YaHei)', value: 'Microsoft YaHei UI' },
    { label: '方正兰亭圆 (FZLanTingYuan)', value: '方正兰亭圆_GBK' },
    { label: '等线 (DengXian)', value: 'DengXian' },
    { label: '宋体 (SimSun)', value: 'SimSun' },
    { label: '楷体 (KaiTi)', value: 'KaiTi' },
    { label: '黑体 (SimHei)', value: 'SimHei' },
  ])

  onMounted(async () => {
    try {
      const systemFonts = await appApi.getSystemFonts()
      if (Array.isArray(systemFonts) && systemFonts.length > 0) {
        const existingValues = new Set(fontOptions.value.map((opt) => opt.value.toLowerCase()))
        systemFonts.forEach((font) => {
          if (!existingValues.has(font.toLowerCase()) && font.trim() !== '') {
            fontOptions.value.push({ label: font, value: font })
          }
        })
      }
    } catch (err) {
      console.error('获取系统字体列表失败:', err)
    }
  })
</script>

<style scoped>
  .ba-card-group {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .ba-section-hint {
    margin: 0;
    color: #5a7394;
    font-size: 13px;
    line-height: 1.65;
    padding: 0 4px;
  }

  .ba-card {
    background: #ffffff;
    border: 1px solid rgba(18, 138, 250, 0.1);
    border-radius: 12px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    transition:
      box-shadow 0.25s,
      transform 0.25s;
  }

  .ba-card:hover {
    box-shadow: 0 4px 20px rgba(18, 138, 250, 0.08);
    transform: translateY(-1px);
  }

  .ba-card-amber {
    border-color: rgba(243, 185, 0, 0.2);
    background: linear-gradient(180deg, #fffef8 0%, #ffffff 100%);
  }

  .ba-card-amber .ba-card-header {
    color: #c48f00;
  }

  .ba-card-purple {
    border-color: rgba(139, 92, 246, 0.15);
    background: linear-gradient(180deg, #faf8ff 0%, #ffffff 100%);
  }

  .ba-card-purple .ba-card-header {
    color: #7c3aed;
  }

  .ba-card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #128afa;
    font-weight: 700;
    font-size: 15px;
  }

  .ba-card-desc {
    margin: 0;
    color: #5a7394;
    font-size: 13px;
    line-height: 1.65;
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
    line-height: 1.5;
  }

  .ba-form-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .ba-label {
    font-size: 14px;
    font-weight: 600;
    color: #1a3a5c;
  }

  .ba-update-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .ba-update-status {
    font-size: 13px;
    font-weight: 600;
    color: #5a7394;
  }

  .ba-status-update {
    color: #1b5fd1;
  }
  .ba-status-ok {
    color: #2f7d4b;
  }
  .ba-status-error {
    color: #c24040;
  }

  .ba-update-detail {
    padding: 10px 14px;
    border: 1px solid #e8f0f8;
    border-radius: 8px;
    background: #f8fbff;
    font-size: 12px;
    color: #5a7394;
    white-space: pre-wrap;
    line-height: 1.6;
  }

  .ba-update-links {
    display: flex;
    gap: 16px;
  }

  .ba-font-preview {
    margin-top: 8px;
    padding: 12px 16px;
    border: 1px dashed rgba(18, 138, 250, 0.2);
    border-radius: 8px;
    background: #fcfdfe;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .ba-preview-label {
    font-size: 11px;
    color: #8ca3bf;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .ba-preview-text {
    font-size: 15px;
    color: #1a3a5c;
    font-weight: 500;
  }
</style>
