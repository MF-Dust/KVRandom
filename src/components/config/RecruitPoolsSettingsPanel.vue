<template>
  <div class="ba-card-group">
    <div class="ba-card">
      <div class="ba-card-header-row">
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
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          <span>招募卡池列表～</span>
        </div>
        <n-button type="primary" size="small" @click="addPool"> 添加新卡池！ </n-button>
      </div>
      <p class="ba-card-desc">
        老师可以在这里定制或者新建所有的招募卡池哦。包括卡池名称、背景视频、起止时间等。拉起招募时会根据这里配置的参数动态渲染。
      </p>
    </div>

    <div
      v-if="!config.recruitPools || config.recruitPools.length === 0"
      class="ba-card ba-empty-card"
    >
      <div class="ba-empty-state">
        <img src="/image/Arona_Empty.webp" alt="空" class="ba-empty-img" />
        <p>目前还没有任何卡池配置哦，点击上方按钮来新增一个吧！</p>
      </div>
    </div>

    <div v-else class="ba-pools-list">
      <n-collapse arrow-placement="right" :default-expanded-names="[config.recruitPools[0]?.id]">
        <n-collapse-item
          v-for="(pool, index) in config.recruitPools"
          :key="pool.id"
          :name="pool.id"
          class="ba-pool-collapse-item"
        >
          <template #header>
            <div class="ba-pool-header">
              <span class="ba-pool-name">{{ pool.name || '未命名卡池' }}</span>
              <span class="ba-pool-meta">
                <n-tag
                  :type="pool.gachaType === 'select' ? 'warning' : 'info'"
                  size="small"
                  round
                  :bordered="false"
                >
                  {{ pool.gachaType === 'select' ? '自选券卡池' : '常规招募' }}
                </n-tag>
                <n-tag
                  :type="getTabTypeColor(pool.tabType)"
                  size="small"
                  round
                  :bordered="false"
                  style="margin-left: 6px"
                >
                  {{ pool.tabType }}
                </n-tag>
              </span>
            </div>
          </template>

          <template #header-extra>
            <n-button text type="error" style="margin-right: 12px" @click.stop="deletePool(index)">
              删除
            </n-button>
          </template>

          <div class="ba-pool-form">
            <div class="ba-form-grid-2">
              <div class="ba-form-item">
                <label class="ba-label">卡池 ID (唯一标识)</label>
                <n-input
                  v-model:value="pool.id"
                  placeholder="例如: pool_new"
                  :disabled="index === 0 && pool.id === 'pool_select'"
                />
              </div>
              <div class="ba-form-item">
                <label class="ba-label">卡池主名称</label>
                <n-input v-model:value="pool.name" placeholder="例如: 常驻招募 (阿比多斯)" />
              </div>
            </div>

            <div class="ba-form-grid-3">
              <div class="ba-form-item">
                <label class="ba-label">左侧页签名称</label>
                <n-input v-model:value="pool.tabName" placeholder="页签上的副标题" />
              </div>
              <div class="ba-form-item">
                <label class="ba-label">页签分类样式</label>
                <n-select v-model:value="pool.tabType" :options="tabTypeOptions" />
              </div>
              <div class="ba-form-item">
                <label class="ba-label">页签缩略图 (可选)</label>
                <n-input v-model:value="pool.tabAvatar" placeholder="本地图片文件名，可空" />
              </div>
            </div>

            <div class="ba-form-grid-2">
              <div class="ba-form-item">
                <label class="ba-label">开始时间</label>
                <n-input v-model:value="pool.startTime" placeholder="格式: YYYY/MM/DD HH:MM" />
              </div>
              <div class="ba-form-item">
                <label class="ba-label">结束时间</label>
                <n-input v-model:value="pool.endTime" placeholder="格式: YYYY/MM/DD HH:MM" />
              </div>
            </div>

            <div class="ba-form-item">
              <label class="ba-label">描述文字</label>
              <n-input
                v-model:value="pool.description"
                type="textarea"
                :autosize="{ minRows: 2 }"
                placeholder="卡池介绍说明..."
              />
            </div>

            <div class="ba-form-grid-2">
              <div class="ba-form-item">
                <label class="ba-label">背景视频地址/路径 (可选)</label>
                <n-input v-model:value="pool.bgVideo" placeholder="支持 Web URL 或 本地路径" />
              </div>
              <div class="ba-form-item">
                <label class="ba-label">背景图片地址/路径 (可选)</label>
                <n-input v-model:value="pool.bgImage" placeholder="视频加载失败或未配置时显示" />
              </div>
            </div>

            <div class="ba-form-grid-3" style="grid-template-columns: 1fr 2fr 2fr">
              <div class="ba-form-item">
                <label class="ba-label">招募类型</label>
                <n-select v-model:value="pool.gachaType" :options="gachaTypeOptions" />
              </div>
              <div class="ba-form-item">
                <label class="ba-label">按钮 1 设置 (文字 | 消耗)</label>
                <div class="ba-btn-setup-row">
                  <n-input
                    v-model:value="pool.buttonText1"
                    placeholder="按钮文字"
                    style="width: 50%"
                  />
                  <n-input
                    v-model:value="pool.buttonCost1"
                    placeholder="消耗描述"
                    style="width: 50%"
                  />
                </div>
              </div>
              <div class="ba-form-item">
                <label class="ba-label">按钮 2 设置 (文字 | 消耗)</label>
                <div class="ba-btn-setup-row">
                  <n-input
                    v-model:value="pool.buttonText2"
                    placeholder="按钮文字"
                    style="width: 50%"
                  />
                  <n-input
                    v-model:value="pool.buttonCost2"
                    placeholder="消耗描述"
                    style="width: 50%"
                  />
                </div>
              </div>
            </div>

            <!-- Rate Boost Students Section -->
            <div v-if="pool.gachaType !== 'select'" class="ba-form-item">
              <div class="ba-rate-boost-header">
                <label class="ba-label">概率提升学生设置</label>
                <n-button size="tiny" type="primary" @click="addRateBoost(pool)">
                  添加学生
                </n-button>
              </div>
              <p class="ba-rate-boost-hint">
                为特定学生设置概率提升倍数，例如设置 2.0 表示该学生的抽取概率提升为原来的 2 倍。
              </p>

              <div
                v-if="pool.rateBoostStudents && pool.rateBoostStudents.length > 0"
                class="ba-rate-boost-list"
              >
                <div
                  v-for="(boost, boostIndex) in pool.rateBoostStudents"
                  :key="boostIndex"
                  class="ba-rate-boost-item"
                >
                  <n-select
                    v-model:value="boost.studentName"
                    placeholder="选择学生"
                    :options="studentOptions"
                    filterable
                    style="flex: 1"
                  />
                  <n-input-number
                    v-model:value="boost.boostMultiplier"
                    placeholder="倍数"
                    :min="1"
                    :max="100"
                    :step="0.1"
                    style="width: 120px"
                  />
                  <n-button
                    text
                    type="error"
                    size="small"
                    @click="removeRateBoost(pool, boostIndex)"
                  >
                    删除
                  </n-button>
                </div>
              </div>
              <div v-else class="ba-rate-boost-empty">
                <span>暂无概率提升设置，点击上方按钮添加～</span>
              </div>
            </div>
          </div>
        </n-collapse-item>
      </n-collapse>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { NButton, NCollapse, NCollapseItem, NInput, NInputNumber, NSelect, NTag } from 'naive-ui'
  import type { RecruitPool } from '@/types/config'

  const props = defineProps({
    config: {
      type: Object,
      required: true,
    },
  })

  const studentOptions = computed(() => {
    if (!props.config.studentList || props.config.studentList.length === 0) {
      return []
    }
    return props.config.studentList.map((student: any) => ({
      label: student.name,
      value: student.name,
    }))
  })

  const tabTypeOptions = [
    { label: '★3生徒セレクト (自选券金)', value: 'select' },
    { label: 'やってこ Your take on! (蓝)', value: 'pickup_blue' },
    { label: '卷いてこ My take on! (粉)', value: 'pickup_pink' },
    { label: '夢を守りしはるはなの (红)', value: 'pickup_red' },
    { label: '通常勧誘 (普通绿)', value: 'gacha' },
  ]

  const gachaTypeOptions = [
    { label: '常规抽选 (gacha)', value: 'gacha' },
    { label: '自选招募 (select)', value: 'select' },
  ]

  const getTabTypeColor = (type: string) => {
    if (type === 'select') return 'warning'
    if (type === 'pickup_blue') return 'info'
    if (type === 'pickup_pink') return 'success'
    if (type === 'pickup_red') return 'error'
    return 'default'
  }

  const addPool = () => {
    if (!props.config.recruitPools) {
      props.config.recruitPools = []
    }
    const newId = `pool_${Date.now()}`
    props.config.recruitPools.push({
      id: newId,
      name: '新增限时招募',
      tabName: '新勧誘開催中!',
      tabType: 'pickup_blue',
      tabAvatar: '',
      bgVideo: '',
      bgImage: '',
      startTime: '2026/05/20 11:00',
      endTime: '2026/06/20 10:59',
      gachaType: 'gacha',
      description: '【限时招募】特定成员的招募概率提升！',
      buttonText1: '招募1次',
      buttonText2: '招募10次',
      buttonCost1: '青辉石 x 120',
      buttonCost2: '青辉石 x 1200',
      rateBoostStudents: [],
    })
  }

  const deletePool = (index: number | string) => {
    const idx = typeof index === 'number' ? index : Number(index)
    if (props.config.recruitPools[idx].id === 'pool_select') {
      // Keep at least one select pool if they want, or warn, but let's allow deleting any except maybe default if needed.
      // Actually, just delete it.
    }
    props.config.recruitPools.splice(idx, 1)
  }

  const addRateBoost = (pool: RecruitPool) => {
    if (!pool.rateBoostStudents) {
      pool.rateBoostStudents = []
    }
    pool.rateBoostStudents.push({
      studentName: '',
      boostMultiplier: 2.0,
    })
  }

  const removeRateBoost = (pool: RecruitPool, index: number | string) => {
    if (pool.rateBoostStudents) {
      const idx = typeof index === 'number' ? index : Number(index)
      pool.rateBoostStudents.splice(idx, 1)
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
    gap: 14px;
  }

  .ba-card-header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
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

  .ba-empty-card {
    align-items: center;
    justify-content: center;
    padding: 40px 0;
  }

  .ba-empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    color: #8ca3bf;
    font-size: 14px;
  }

  .ba-empty-img {
    width: 120px;
    height: auto;
    opacity: 0.7;
  }

  .ba-pools-list {
    background: #ffffff;
    border: 1px solid rgba(18, 138, 250, 0.1);
    border-radius: 12px;
    padding: 16px;
  }

  .ba-pool-collapse-item {
    border-bottom: 1px solid #f0f4f8;
    padding: 8px 0;
  }

  .ba-pool-header {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .ba-pool-name {
    font-weight: 700;
    color: #1a3a5c;
    font-size: 14px;
  }

  .ba-pool-meta {
    display: flex;
    align-items: center;
  }

  .ba-pool-form {
    padding: 14px 8px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    background: #fafcff;
    border-radius: 8px;
    border: 1px dashed rgba(18, 138, 250, 0.15);
    margin-top: 8px;
  }

  .ba-form-grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  .ba-form-grid-3 {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 16px;
  }

  .ba-form-item {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .ba-label {
    font-size: 13px;
    font-weight: 600;
    color: #1a3a5c;
  }

  .ba-btn-setup-row {
    display: flex;
    gap: 8px;
  }

  .ba-rate-boost-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
  }

  .ba-rate-boost-hint {
    margin: 0 0 12px 0;
    color: #8ca3bf;
    font-size: 12px;
    line-height: 1.5;
  }

  .ba-rate-boost-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .ba-rate-boost-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px;
    background: #ffffff;
    border: 1px solid rgba(18, 138, 250, 0.15);
    border-radius: 6px;
  }

  .ba-rate-boost-empty {
    padding: 20px;
    text-align: center;
    color: #8ca3bf;
    font-size: 13px;
    background: #f8fafc;
    border: 1px dashed rgba(18, 138, 250, 0.2);
    border-radius: 6px;
  }

  @media (max-width: 768px) {
    .ba-form-grid-2,
    .ba-form-grid-3 {
      grid-template-columns: 1fr;
      gap: 12px;
    }
  }
</style>
