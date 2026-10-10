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
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
        <span>名单导入～</span>
      </div>
      <p class="ba-card-desc">
        老师每行写一个名字就好啦～也可以直接导入 CSV 或 TXT 文件，我会自动帮老师整理好的 ♪
      </p>
      <div class="ba-import-actions">
        <n-button type="primary" secondary @click="$emit('import-file')">
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
              <path
                d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"
              />
            </svg>
          </template>
          从文件导入～
        </n-button>
        <n-tag type="info" round>已经录入 {{ studentCount }} 人啦～</n-tag>
      </div>
      <n-input
        type="textarea"
        :value="rawListText"
        placeholder="请输入名单，每行一位。例如：
早濑优香
小鸟游星野
空崎日奈"
        :rows="8"
        :resizable="true"
        @update:value="
          (val) => {
            $emit('update:raw-list-text', val)
            $emit('schedule-sync')
          }
        "
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { NButton, NInput, NTag } from 'naive-ui'

  defineProps({
    rawListText: {
      type: String,
      required: true,
    },
    studentCount: {
      type: Number,
      required: true,
    },
  })

  defineEmits(['update:raw-list-text', 'schedule-sync', 'import-file'])
</script>

<style scoped>
  .ba-import-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
</style>
