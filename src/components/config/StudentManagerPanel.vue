<template>
  <div class="ba-card-group">
    <div class="ba-card">
      <div class="ba-card-header">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
        <span>名单一览～</span>
      </div>
      <p class="ba-card-desc">老师可以在这里查看所有人和他们的抽取权重哦～默认权重是 1.0，数值越高就越容易被抽到，很简单对吧！</p>
      <div class="ba-toggle-row">
        <n-switch v-model:value="config.allowRepeatDraw" />
        <span class="ba-toggle-label">允许重复点名～同一个人可能被点到好几次哦！</span>
      </div>
    </div>

    <div class="ba-card">
      <div v-if="config.studentList.length === 0" class="ba-empty-state">
        <img src="/image/Arona_Empty.webp" alt="阿罗娜空空" class="ba-empty-img" />
        <p>这里还没有名单呢～老师先去「导入名单」填写一下吧</p>
      </div>
      <template v-else>
        <div class="ba-table-wrapper">
          <table class="ba-student-table">
            <thead>
              <tr>
                <th class="col-name">名字</th>
                <th class="col-academy">学院</th>
                <th class="col-club">社团</th>
                <th class="col-weight">权重（0.0 - 2.0）</th>
                <th class="col-action">删除</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(student, index) in config.studentList" :key="`${student.name}-${index}`">
                <td class="col-name">{{ student.name }}</td>
                <td class="col-academy">
                  <n-input
                    v-model:value="student.academy"
                    placeholder="未设置学院"
                    size="small"
                    style="max-width: 140px;"
                  />
                </td>
                <td class="col-club">
                  <n-input
                    v-model:value="student.club"
                    placeholder="未设置社团"
                    size="small"
                    style="max-width: 140px;"
                  />
                </td>
                <td class="col-weight">
                  <div class="ba-weight-cell">
                    <n-slider
                      v-model:value="student.weight"
                      :min="0"
                      :max="2"
                      :step="0.1"
                      :tooltip="false"
                      style="flex: 1; min-width: 80px;"
                    />
                    <n-tag type="info" size="small" round :bordered="false" style="min-width: 36px; text-align: center;">
                      {{ Number(student.weight).toFixed(1) }}
                    </n-tag>
                  </div>
                </td>
                <td class="col-action">
                  <button type="button" class="ba-del-btn" @click="$emit('remove-student', index)" title="删掉～">
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="ba-student-actions">
          <n-button type="primary" @click="showBatchAddModal = true" style="margin-right: 12px;">
            批量添加学生～
          </n-button>
          <n-button secondary type="warning" @click="$emit('reset-weights')">
            一键重置所有权重为 1.0！
          </n-button>
        </div>
      </template>
    </div>

    <!-- 批量添加弹窗 -->
    <n-modal
      v-model:show="showBatchAddModal"
      preset="card"
      style="width: 500px; border-radius: 12px; border: 1px solid rgba(18, 138, 250, 0.15);"
      title="批量添加学生名单"
      :bordered="false"
      size="huge"
    >
      <div class="ba-batch-add-container">
        <p class="ba-batch-desc">
          老师可以在下面每一行输入一个学生的信息，格式为：<br/>
          <code>姓名, 学院, 社团</code> （例如：<code>白子, 阿比多斯, 对策委员会</code>）<br/>
          如果只想输入名字，直接写名字即可（例如：<code>阿罗娜</code>）。
        </p>
        <n-input
          v-model:value="batchAddText"
          type="textarea"
          :autosize="{ minRows: 6, maxRows: 12 }"
          placeholder="阿罗娜, 夏莱, 学生会&#10;白子, 阿比多斯, 对策委员会&#10;星野, 阿比多斯, 对策委员会"
          style="margin-bottom: 16px;"
        />
        <div class="ba-modal-actions">
          <n-button secondary @click="showBatchAddModal = false">取消</n-button>
          <n-button type="primary" @click="handleBatchAdd">确认添加～</n-button>
        </div>
      </div>
    </n-modal>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { NButton, NSlider, NSwitch, NTag, NInput, NModal } from 'naive-ui'

defineProps({
  config: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['remove-student', 'reset-weights', 'add-students'])

const showBatchAddModal = ref(false)
const batchAddText = ref('')

const handleBatchAdd = () => {
  const text = batchAddText.value.trim()
  if (!text) {
    showBatchAddModal.value = false
    return
  }

  const addedStudents = []
  const lines = text.split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue
    // Split by comma (half-width or full-width), slash, vertical bar, or tab
    const parts = trimmed.split(/[,，/|\t]+/).map(p => p.trim())
    if (parts.length > 0 && parts[0]) {
      const name = parts[0]
      const academy = parts[1] || ''
      const club = parts[2] || ''
      addedStudents.push({
        name,
        weight: 1.0,
        academy: academy || undefined,
        club: club || undefined,
        avatar: undefined
      })
    }
  }

  if (addedStudents.length > 0) {
    emit('add-students', addedStudents)
  }

  batchAddText.value = ''
  showBatchAddModal.value = false
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
  border: 1px solid rgba(18, 138, 250, 0.10);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  transition: box-shadow 0.25s, transform 0.25s;
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

.ba-card-desc {
  margin: 0;
  color: #5a7394;
  font-size: 13px;
  line-height: 1.65;
}

.ba-toggle-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ba-toggle-label {
  font-size: 14px;
  color: #1a3a5c;
}

.ba-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px 0;
  color: #8ca3bf;
  font-size: 14px;
}

.ba-empty-img {
  width: 120px;
  height: auto;
  opacity: 0.7;
}

.ba-table-wrapper {
  max-height: 360px;
  overflow-y: auto;
  border: 1px solid rgba(18, 138, 250, 0.10);
  border-radius: 10px;
  scrollbar-width: thin;
  scrollbar-color: #b8d4f0 transparent;
}

.ba-student-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.ba-student-table th {
  padding: 10px 14px;
  background: linear-gradient(180deg, #f0f7ff 0%, #e4f0ff 100%);
  color: #1a5a96;
  font-weight: 600;
  font-size: 13px;
  border-bottom: 1px solid rgba(18, 138, 250, 0.15);
  position: sticky;
  top: 0;
  z-index: 1;
}

.ba-student-table td {
  padding: 8px 14px;
  border-bottom: 1px solid #f0f4f8;
  color: #1a3a5c;
  font-size: 14px;
  vertical-align: middle;
}

.col-name {
  width: 15%;
  min-width: 80px;
}

.col-academy {
  width: 25%;
  min-width: 120px;
}

.col-club {
  width: 25%;
  min-width: 120px;
}

.col-weight {
  width: 28%;
  min-width: 140px;
}

.col-action {
  width: 7%;
  min-width: 50px;
  text-align: center;
}

.ba-student-table tbody tr {
  transition: background 0.15s;
}

.ba-student-table tbody tr:hover {
  background: rgba(18, 138, 250, 0.03);
}

.ba-weight-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ba-del-btn {
  background: none;
  border: none;
  color: #d44747;
  cursor: pointer;
  padding: 6px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.ba-del-btn:hover {
  background: #fff0f0;
  color: #c03030;
}

.ba-student-actions {
  display: flex;
  justify-content: flex-end;
}

.ba-batch-add-container {
  display: flex;
  flex-direction: column;
}

.ba-batch-desc {
  font-size: 13px;
  color: #5a7394;
  line-height: 1.6;
  margin-bottom: 12px;
}

.ba-batch-desc code {
  background: #f0f7ff;
  color: #128afa;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: inherit;
  font-weight: 600;
}

.ba-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
}
</style>
