<template>
  <div class="recruit-container">
    <!-- Header Bar -->
    <header class="recruit-header">
      <div class="header-left">
        <button class="header-back-btn" title="返回" @click="handleExit">
          <svg
            viewBox="0 0 24 24"
            width="22"
            height="22"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
        <span class="header-title">招募成员</span>
      </div>

      <div class="header-right">
        <!-- AP Currency -->
        <div class="currency-item ap-pill">
          <div class="currency-icon-wrapper">
            <svg class="currency-svg" viewBox="0 0 24 24" width="16" height="16">
              <path d="M12 2L2 7l10 5 10-5-10-5z" fill="#00E676" />
              <path
                d="M2 17l10 5 10-5M2 12l10 5 10-5"
                stroke="#00E676"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                fill="none"
              />
            </svg>
          </div>
          <span class="currency-val" style="font-weight: 900; font-family: monospace">INF</span>
          <button class="currency-add-btn" @click="openReplenish('ap')">+</button>
        </div>

        <!-- Credit Currency -->
        <div class="currency-item credit-pill">
          <div class="currency-icon-wrapper">
            <img src="/image/credit.png" class="currency-icon-img" alt="Credit" />
          </div>
          <span class="currency-val" style="font-weight: 900; font-family: monospace">INF</span>
          <button class="currency-add-btn" @click="openReplenish('credit')">+</button>
        </div>

        <!-- Pyroxene Currency -->
        <div class="currency-item pyroxene-pill">
          <div class="currency-icon-wrapper">
            <img src="/image/pyroxene.png" class="currency-icon-img" alt="Pyroxene" />
          </div>
          <span class="currency-val" style="font-weight: 900; font-family: monospace">INF</span>
          <button class="currency-add-btn" @click="openReplenish('pyroxene')">+</button>
        </div>

        <!-- 10-Draw Recruit Ticket -->
        <div class="currency-item ticket10-pill">
          <div class="currency-icon-wrapper">
            <img
              src="/image/recruit_ticket_10.webp"
              class="currency-icon-img"
              alt="10-Draw Ticket"
            />
          </div>
          <span class="currency-val" style="font-weight: 900; font-family: monospace">INF</span>
          <button class="currency-add-btn" @click="openReplenish('recruitTicket10')">+</button>
        </div>

        <!-- 1-Draw Recruit Ticket -->
        <div class="currency-item ticket1-pill">
          <div class="currency-icon-wrapper">
            <img src="/image/recruit_ticket_1.webp" class="currency-icon-img" alt="1-Draw Ticket" />
          </div>
          <span class="currency-val" style="font-weight: 900; font-family: monospace">INF</span>
          <button class="currency-add-btn" @click="openReplenish('recruitTicket1')">+</button>
        </div>

        <!-- Selection Ticket (Optional display if present) -->
        <div class="currency-item ticket-pill">
          <div class="currency-icon-wrapper">
            <img
              src="/image/recruit_ticket_1.webp"
              class="currency-icon-img"
              alt="Selection Ticket"
            />
          </div>
          <span class="currency-val" style="font-weight: 900; font-family: monospace">INF</span>
          <button class="currency-add-btn" @click="openReplenish('ticket')">+</button>
        </div>

        <!-- Settings Button -->
        <button class="header-setting-btn" title="设置" @click="handleOpenSettings">
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="3" />
            <path
              d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
            />
          </svg>
        </button>

        <!-- Home Button -->
        <button class="header-home-btn" title="主页" @click="handleExit">
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </button>
      </div>
    </header>

    <!-- Main Screen (Left Sidebar & Right Stage) -->
    <div class="recruit-workspace">
      <!-- Sidebar Tabs -->
      <aside class="recruit-sidebar">
        <div class="sidebar-tabs-container">
          <div
            v-for="(pool, idx) in pools"
            :key="pool.id"
            class="sidebar-tab-item"
            :class="[{ 'is-active': activePoolIndex === idx }]"
            @click="switchPool(idx)"
          >
            <div
              class="tab-banner-image"
              :style="pool.tabAvatar ? `background-image: url('${pool.tabAvatar}');` : ''"
            >
              <div
                v-if="!pool.tabAvatar"
                class="tab-banner-fallback"
                :class="`fallback-${pool.tabType}`"
              >
                <span class="fallback-main">{{ pool.name }}</span>
                <span class="fallback-sub">{{ pool.tabName }}</span>
              </div>
            </div>
            <div class="tab-active-glow"></div>
          </div>
        </div>

        <!-- Bottom left selectable members button -->
        <button class="selectable-members-btn" @click="showRatesModal">可选的成员</button>
      </aside>

      <!-- Stage Content -->
      <main class="recruit-stage">
        <!-- Background Layer -->
        <div class="stage-bg-container">
          <video
            v-if="currentPool?.bgVideo"
            :key="currentPool.id + '-video'"
            class="stage-bg-video"
            autoplay
            loop
            muted
            playsinline
          >
            <source :src="currentPool.bgVideo" />
          </video>
          <div
            v-else-if="currentPool?.bgImage"
            class="stage-bg-image"
            :style="`background-image: url('${currentPool.bgImage}');`"
          ></div>
          <div v-else class="ba-css-bg">
            <div class="ba-bg-grids"></div>
            <div class="ba-bg-stripes"></div>
            <div class="ba-bg-rays"></div>
            <div class="ba-bg-shards">
              <div class="ba-shard ba-shard-1"></div>
              <div class="ba-shard ba-shard-2"></div>
              <div class="ba-shard ba-shard-3"></div>
              <div class="ba-shard ba-shard-4"></div>
            </div>
          </div>
        </div>

        <!-- Info Overlay with white bottom gradient -->
        <div class="stage-overlay">
          <div class="pool-text-info">
            <h2 class="pool-title">{{ currentPool?.name || '★3学生自选招募' }}</h2>
            <div class="pool-period">
              <span
                >{{ currentPool?.startTime || '2025/07/22 11:00' }} ～
                {{ currentPool?.endTime || '2026/06/24 10:59' }}截止</span
              >
            </div>
          </div>

          <!-- Bottom Actions Row -->
          <div class="stage-actions-row">
            <!-- Magnifying Glass -->
            <button class="rates-search-btn" title="成员一览" @click="showRatesModal">
              <div class="rates-btn-box">
                <svg
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="3"
                >
                  <circle cx="10" cy="10" r="6" />
                  <line x1="21" y1="21" x2="15" y2="15" />
                </svg>
              </div>
            </button>

            <!-- Gacha Buttons -->
            <div class="gacha-buttons-wrapper">
              <template v-if="currentPool?.gachaType === 'gacha'">
                <button class="gacha-btn btn-single" @click="handleGacha(1)">
                  <div class="gacha-btn-inner gacha-classic">
                    <div class="gacha-left-icon">
                      <img src="/image/recruit_envelope_1.png" alt="1 Draw" />
                    </div>
                    <div class="gacha-right-content">
                      <div class="gacha-cost-pill">
                        <img
                          :src="true ? '/image/recruit_ticket_1.webp' : '/image/pyroxene.png'"
                          class="btn-cost-icon"
                          alt="cost"
                        />
                        <span>{{ true ? '1' : '120' }}</span>
                      </div>
                      <span class="gacha-btn-title">{{
                        currentPool.buttonText1 || '招募1次'
                      }}</span>
                    </div>
                  </div>
                </button>
                <button class="gacha-btn btn-multi" @click="handleGacha(10)">
                  <div class="gacha-btn-inner gacha-classic">
                    <div class="gacha-left-icon">
                      <img src="/image/recruit_envelope_10.png" alt="10 Draw" />
                    </div>
                    <div class="gacha-right-content">
                      <div class="gacha-cost-pill">
                        <img
                          :src="true ? '/image/recruit_ticket_10.webp' : '/image/pyroxene.png'"
                          class="btn-cost-icon"
                          alt="cost"
                        />
                        <span>{{ true ? '1' : '1,200' }}</span>
                      </div>
                      <span class="gacha-btn-title">{{
                        currentPool.buttonText2 || '招募10次'
                      }}</span>
                    </div>
                  </div>
                </button>
              </template>
              <template v-else-if="currentPool?.gachaType === 'select'">
                <!-- Buy Ticket (Yellow / btn-multi style) -->
                <div
                  class="gacha-btn btn-multi"
                  style="overflow: visible"
                  @click="openReplenish('ticket')"
                >
                  <div class="btn-ticket-bubble">
                    距离结束剩余<span class="tag-highlight">32天</span>
                  </div>
                  <div class="gacha-btn-inner gacha-classic">
                    <div
                      class="gacha-left-icon"
                      style="width: 110px; margin-top: -10px; margin-left: -15px"
                    >
                      <img
                        src="/image/select_ticket.png"
                        alt="Buy Ticket"
                        style="
                          transform: rotate(-5deg);
                          filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3));
                        "
                      />
                    </div>
                    <div class="gacha-right-content">
                      <div class="gacha-cost-pill">
                        <img src="/image/credit.png" class="btn-cost-icon" alt="cost" />
                        <span>3,000</span>
                      </div>
                      <span class="gacha-btn-title">{{
                        currentPool.buttonText1 || '购买自选券'
                      }}</span>
                    </div>
                  </div>
                </div>

                <!-- Use Ticket (Blue / btn-single style) -->
                <div class="gacha-btn btn-single" @click="openSelectionModal">
                  <div class="gacha-btn-inner gacha-classic">
                    <div
                      class="gacha-left-icon"
                      style="width: 55px; margin-left: 15px; margin-top: 0"
                    >
                      <img
                        src="/image/select_ticket.png"
                        alt="Use Ticket"
                        style="transform: rotate(-10deg)"
                      />
                    </div>
                    <div class="gacha-right-content">
                      <div class="gacha-cost-pill">
                        <span>1</span>
                      </div>
                      <span class="gacha-btn-title">{{
                        currentPool.buttonText2 || '使用自选券'
                      }}</span>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Replenish Dialog -->
    <div v-if="showReplenishDialog" class="ba-modal-overlay">
      <div class="ba-dialog-box animate-pop">
        <div class="ba-dialog-header">阿罗娜的补给箱～</div>
        <div class="ba-dialog-content">
          <p v-if="replenishTarget === 'pyroxene'">
            老师，要阿罗娜为您补充 <span class="highlight">1,200 青辉石</span> 吗？
          </p>
          <p v-else-if="replenishTarget === 'credit'">
            老师，要阿罗娜为您充值 <span class="highlight">10,000,000 信用积分</span> 吗？
          </p>
          <p v-else-if="replenishTarget === 'ap'">
            老师，要阿罗娜为您补充 <span class="highlight">120 AP</span> 吗？
          </p>
          <p v-else-if="replenishTarget === 'recruitTicket1'">
            老师，要阿罗娜为您补充 <span class="highlight">10张 1次招募券</span> 吗？
          </p>
          <p v-else-if="replenishTarget === 'recruitTicket10'">
            老师，要阿罗娜为您补充 <span class="highlight">2张 10次招募券</span> 吗？
          </p>
          <p v-else-if="replenishTarget === 'ticket'">
            老师，要阿罗娜为您补充 <span class="highlight">1张 ★3学生自选券</span> 吗？<br /><small
              style="color: #8c9ba5"
              >(需要消耗 30,000,000 信用积分)</small
            >
          </p>
        </div>
        <div class="ba-dialog-actions">
          <button class="ba-btn-cancel" @click="closeReplenishDialog">先不要了</button>
          <button class="ba-btn-confirm" @click="confirmReplenish">确认！</button>
        </div>
      </div>
    </div>

    <!-- Student Details Modal (Rates list) -->
    <div v-if="showDetailsModal" class="ba-modal-overlay">
      <div class="ba-list-modal animate-pop">
        <div class="ba-modal-header">
          <span>招募名单 & 概率概率一览～</span>
          <button class="ba-modal-close" @click="showDetailsModal = false">
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              stroke="currentColor"
              stroke-width="3"
              fill="none"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div class="ba-modal-body">
          <div class="ba-rates-summary">
            <span>总人数: {{ students.length }} 人</span>
            <span>由于是完全随机点名，所以当前每个学生的招募权重决定其招募概率哦！</span>
          </div>
          <table class="ba-rates-table">
            <thead>
              <tr>
                <th>学生名字</th>
                <th>学院</th>
                <th>社团</th>
                <th>权重</th>
                <th>预测概率</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="student in sortedStudents" :key="student.name">
                <td class="td-name">{{ student.name }}</td>
                <td>{{ student.academy || '未知' }}</td>
                <td>{{ student.club || '未知' }}</td>
                <td class="td-weight">{{ student.weight.toFixed(1) }}</td>
                <td class="td-prob">{{ calculateProb(student.weight) }}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Student Selection Ticket Modal -->
    <div v-if="showSelectionModal" class="ba-modal-overlay">
      <div class="ba-list-modal select-modal animate-pop">
        <div class="ba-modal-header">
          <span>请选择要招募的学生 (使用 ★3自选券)</span>
          <button class="ba-modal-close" @click="showSelectionModal = false">
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              stroke="currentColor"
              stroke-width="3"
              fill="none"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div class="ba-modal-body">
          <p class="select-desc">
            老师可以任意挑选一名已在名单中的学生，使用自选券将直接把她接回学校哦！
          </p>
          <div class="student-select-grid">
            <div
              v-for="student in students"
              :key="student.name"
              class="student-select-card"
              :class="{ 'is-selected': selectedStudent?.name === student.name }"
              @click="selectStudent(student)"
            >
              <div class="student-avatar-box">
                <span class="student-emoji">🎓</span>
              </div>
              <div class="student-info">
                <span class="student-select-name">{{ student.name }}</span>
                <span class="student-select-school">{{ student.academy || '未登记学院' }}</span>
              </div>
              <div v-if="selectedStudent?.name === student.name" class="student-select-tick">✓</div>
            </div>
          </div>
        </div>
        <div class="ba-modal-footer">
          <button class="ba-btn-cancel" @click="showSelectionModal = false">先返回</button>
          <button
            class="ba-btn-confirm"
            :disabled="!selectedStudent"
            @click="confirmStudentSelection"
          >
            确认招募！
          </button>
        </div>
      </div>
    </div>

    <!-- Video Overlay -->
    <div v-if="isPlayingVideo" class="video-overlay" @click="skipVideo">
      <video class="gacha-video" src="/video/vid.mp4" autoplay @ended="handleVideoEnd"></video>
      <div class="skip-hint">点击跳过 / Click to skip</div>
    </div>

    <!-- Recruit Result Overlay -->
    <div v-show="showResultOverlay" class="recruit-result-overlay">
      <PickResult :is-recruit-mode="true" @draw-again="handleGacha(10)" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { appApi, recruitApi } from '../tauriApi'
  import { audioApi } from '../api/audioApi'
  import { pickCountApi } from '../api/pickCountApi'
  import { pickResultApi } from '../api/pickResultApi'
  import PickResult from './PickResult.vue'

  const pools = ref<any[]>([])
  const activePoolIndex = ref(0)
  const students = ref<any[]>([])

  // Interactive Currencies persisted locally
  const currencies = ref({
    pyroxene: 12000,
    credit: 50000000,
    ap: 120,
    selectionTicket: 1,
    recruitTicket1: 5,
    recruitTicket10: 1,
  })

  const showReplenishDialog = ref(false)
  const replenishTarget = ref('')
  const showDetailsModal = ref(false)
  const showSelectionModal = ref(false)
  const selectedStudent = ref<any>(null)

  // Recruit Result Display
  const showResultOverlay = ref(false)

  // Video Playback Logic
  const isPlayingVideo = ref(false)
  let pendingRecruitAction: (() => Promise<void>) | null = null

  const playVideoAndExecute = (action: () => Promise<void>) => {
    pendingRecruitAction = action
    isPlayingVideo.value = true
  }

  const handleVideoEnd = async () => {
    isPlayingVideo.value = false
    if (pendingRecruitAction) {
      await pendingRecruitAction()
      pendingRecruitAction = null
    }
  }

  const skipVideo = () => {
    handleVideoEnd()
  }

  const currentPool = computed(() => pools.value[activePoolIndex.value] || null)

  // Sum of weights for rates calc
  const totalWeight = computed(() => {
    return students.value.reduce((sum, s) => sum + (s.weight || 0), 0)
  })

  // Sort students by probability/weight descending
  const sortedStudents = computed(() => {
    return [...students.value].sort((a, b) => b.weight - a.weight)
  })

  // Lifecycle
  onMounted(async () => {
    // Load persisted currencies
    const savedCurrencies = localStorage.getItem('ba_recruit_currencies')
    if (savedCurrencies) {
      try {
        const parsed = JSON.parse(savedCurrencies)
        currencies.value = {
          pyroxene: parsed.pyroxene ?? 12000,
          credit: parsed.credit ?? 50000000,
          ap: parsed.ap ?? 120,
          selectionTicket: parsed.selectionTicket ?? 1,
          recruitTicket1: parsed.recruitTicket1 ?? 5,
          recruitTicket10: parsed.recruitTicket10 ?? 1,
        }
      } catch (e) {
        console.error(e)
      }
    }

    // Load config & student list
    try {
      const config = (await appApi.getConfig()) as {
        studentList?: unknown[]
        recruitPools?: unknown[]
      } | null
      if (config) {
        students.value = (config.studentList || []) as unknown[]
        pools.value = (config.recruitPools || []) as unknown[]
      }
    } catch (err) {
      console.error('Failed to load configuration:', err)
    }

    pickResultApi.onOpen(() => {
      showResultOverlay.value = true
    })

    pickResultApi.onReset((rawPayload) => {
      const payload = rawPayload as { reason?: string } | null
      if (payload?.reason === 'close') {
        showResultOverlay.value = false
      }
    })
  })

  // Methods
  const saveCurrencies = () => {
    localStorage.setItem('ba_recruit_currencies', JSON.stringify(currencies.value))
  }

  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  const getTabTypeColor = (type: string) => {
    if (type === 'select') return 'warning'
    if (type === 'pickup_blue') return 'info'
    if (type === 'pickup_pink') return 'success'
    if (type === 'pickup_red') return 'error'
    return 'default'
  }

  const switchPool = async (idx: number) => {
    activePoolIndex.value = idx
    try {
      await audioApi.playClickSound()
    } catch (e) {}
  }

  const handleExit = async () => {
    try {
      await audioApi.playClickSound()
    } catch (e) {}
    try {
      await recruitApi.closeRecruit()
    } catch (e) {
      console.error('Failed to close recruit window:', e)
    }
  }

  const handleOpenSettings = async () => {
    try {
      await audioApi.playClickSound()
      await recruitApi.openConfig()
    } catch (e) {
      console.error(e)
    }
  }

  // Replenishment actions
  const openReplenish = async (target: string) => {
    try {
      await audioApi.playClickSound()
    } catch (e) {}
    replenishTarget.value = target
    showReplenishDialog.value = true
  }

  const closeReplenishDialog = async () => {
    try {
      await audioApi.playClickSound()
    } catch (e) {}
    showReplenishDialog.value = false
    replenishTarget.value = ''
  }

  const confirmReplenish = async () => {
    try {
      await audioApi.playClickSound()
    } catch (e) {}

    if (replenishTarget.value === 'pyroxene') {
      currencies.value.pyroxene += 1200
    } else if (replenishTarget.value === 'credit') {
      currencies.value.credit += 10000000
    } else if (replenishTarget.value === 'ap') {
      currencies.value.ap = 120
    } else if (replenishTarget.value === 'recruitTicket1') {
      currencies.value.recruitTicket1 += 10
    } else if (replenishTarget.value === 'recruitTicket10') {
      currencies.value.recruitTicket10 += 2
    } else if (replenishTarget.value === 'ticket') {
      if (currencies.value.credit < 30000000) {
        alert('老师，信用积分不足以购买自选券哦！点击加号补充一下信用积分吧～')
        closeReplenishDialog()
        return
      }
      currencies.value.credit -= 30000000
      currencies.value.selectionTicket += 1
    }

    saveCurrencies()
    closeReplenishDialog()
  }

  // Rates Modal
  const showRatesModal = async () => {
    try {
      await audioApi.playClickSound()
    } catch (e) {}
    showDetailsModal.value = true
  }

  const calculateProb = (weight: number) => {
    if (totalWeight.value <= 0) return '0.00'
    return ((weight / totalWeight.value) * 100).toFixed(2)
  }

  // Regular Gacha (Draw 1 or 10)
  const handleGacha = async (count: number) => {
    try {
      await audioApi.playClickSound()
    } catch (e) {}

    if (students.value.length === 0) {
      alert('老师，名单中还没有任何成员哦！先去设置面板「导入名单」吧～')
      return
    }

    if (count === 1) {
      if (currencies.value.recruitTicket1 > 0) {
        currencies.value.recruitTicket1 -= 1
      } else {
        const cost = 120
        if (currencies.value.pyroxene < cost) {
          alert('老师，招募券与青辉石都不够了哦！点击上方加号补充一下吧～')
          return
        }
        currencies.value.pyroxene -= cost
      }
    } else {
      if (currencies.value.recruitTicket10 > 0) {
        currencies.value.recruitTicket10 -= 1
      } else {
        const cost = 1200
        if (currencies.value.pyroxene < cost) {
          alert('老师，招募券与青辉石都不够了哦！点击上方加号补充一下吧～')
          return
        }
        currencies.value.pyroxene -= cost
      }
    }

    saveCurrencies()

    playVideoAndExecute(async () => {
      try {
        // Confirm pick count, hide recruit window, track draw source as 'recruit'
        await pickCountApi.confirm(count, false, 'recruit')
      } catch (err) {
        console.error('Failed to trigger recruit draw:', err)
      }
    })
  }

  // Selection ticket recruitment
  const openSelectionModal = async () => {
    try {
      await audioApi.playClickSound()
    } catch (e) {}

    if (currencies.value.selectionTicket < 1) {
      alert('老师，您手头上没有自选券了哦，点击左侧按钮可以购买一张自选券～')
      return
    }

    if (students.value.length === 0) {
      alert('老师，名单中还没有任何学生哦，自选券找不到人可以招募呀～')
      return
    }

    selectedStudent.value = null
    showSelectionModal.value = true
  }

  const selectStudent = async (student: unknown) => {
    try {
      await audioApi.playClickSound()
    } catch (e) {}
    selectedStudent.value = student
  }

  const confirmStudentSelection = async () => {
    if (!selectedStudent.value) return

    try {
      await audioApi.playClickSound()
    } catch (e) {}

    // Selection tickets are an entry condition only; select recruitment is intentionally no-consume.
    saveCurrencies()

    showSelectionModal.value = false

    playVideoAndExecute(async () => {
      try {
        await recruitApi.confirmSelectStudent(selectedStudent.value.name, 'recruit')
      } catch (err) {
        console.error('Failed to recruit selected student:', err)
      }
    })
  }
</script>

<style scoped>
  /* ==========================================================================
   Blue Archive Recruitment Interface Styling
   ========================================================================== */

  /* Variables */
  .recruit-container {
    --ba-blue: #128afa;
    --ba-blue-dark: #0068df;
    --ba-blue-light: #e8f4ff;
    --ba-gold: #ffd84d;
    --ba-gold-dark: #e6a23c;
    --ba-pink: #ff6b8b;
    --ba-red: #f56c6c;
    --ba-dark: #1a3a5c;
    --ba-muted: #8ca3bf;
    --ba-white: #ffffff;
    --ba-trans-dark: rgba(26, 58, 92, 0.85);

    position: relative;
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background-color: #ebf4fc;
    font-family: 'Segoe UI Variable', 'Microsoft YaHei UI', system-ui, sans-serif;
    color: var(--ba-dark);
    user-select: none;
  }

  /* Header */
  .recruit-header {
    height: 56px;
    background: linear-gradient(
      to bottom,
      rgba(255, 255, 255, 0.9) 0%,
      rgba(255, 255, 255, 0.6) 100%
    );
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    position: relative;
    z-index: 10;
    backdrop-filter: blur(5px);
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .header-back-btn {
    background: var(--ba-blue-dark);
    border: none;
    color: var(--ba-white);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    transition:
      transform 0.2s,
      background 0.2s;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  }

  .header-back-btn:hover {
    background: var(--ba-blue-light);
  }

  .header-back-btn:active {
    transform: scale(0.92);
  }

  .header-title {
    font-size: 20px;
    font-weight: 900;
    color: var(--ba-blue-dark);
    letter-spacing: 2px;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  /* Currency Pills */
  .currency-item {
    display: flex;
    align-items: center;
    gap: 6px;
    background: transparent;
    padding: 0 10px;
    position: relative;
  }

  .currency-item:not(:last-child)::after {
    content: '';
    position: absolute;
    right: -5px;
    top: 15%;
    height: 70%;
    width: 1px;
    background: rgba(0, 0, 0, 0.2);
  }

  .currency-icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
  }

  .currency-val {
    flex: 1;
    text-align: right;
    padding-right: 6px;
  }

  .currency-add-btn {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: var(--ba-gold);
    border: 1px solid var(--ba-gold-dark);
    color: var(--ba-dark);
    font-weight: 900;
    font-size: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition:
      transform 0.15s,
      background 0.15s;
  }

  .currency-add-btn:hover {
    background: #ffe485;
  }

  .currency-add-btn:active {
    transform: scale(0.9);
  }

  .header-setting-btn,
  .header-home-btn {
    background: transparent;
    border: none;
    color: var(--ba-muted);
    cursor: pointer;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition:
      background 0.2s,
      color 0.2s;
  }

  .header-setting-btn:hover,
  .header-home-btn:hover {
    background: var(--ba-blue-light);
    color: var(--ba-blue);
  }

  /* Workspace Grid */
  .recruit-workspace {
    flex: 1;
    display: flex;
    height: calc(100vh - 56px);
    background: linear-gradient(135deg, #b5cceb 0%, #d8e4f8 100%);
    padding: 12px 16px 16px 16px;
    gap: 16px;
    overflow: hidden;
  }

  /* Sidebar Tab list */
  .recruit-sidebar {
    width: 200px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    z-index: 10;
  }

  .sidebar-tabs-container {
    display: flex;
    flex-direction: column;
    gap: 12px;
    overflow-y: auto;
    overflow-x: hidden;
    padding-right: 4px;
    padding-top: 4px;
    /* Scrollbar hiding for cleaner look */
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .sidebar-tabs-container::-webkit-scrollbar {
    display: none;
  }

  .sidebar-tab-item {
    position: relative;
    height: 64px;
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    background: #ffffff;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
    transition:
      transform 0.2s,
      box-shadow 0.2s;
    flex-shrink: 0;
    border: 2px solid transparent;
  }

  .sidebar-tab-item:not(.is-active):hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.2);
  }

  .sidebar-tab-item.is-active {
    border-color: #ffde00;
    box-shadow:
      0 0 12px rgba(255, 222, 0, 0.8),
      0 4px 10px rgba(0, 0, 0, 0.15);
    transform: scale(1.02);
    z-index: 5;
  }

  .tab-banner-image {
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  }

  .tab-banner-fallback {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #f0f6fa 0%, #dce7f3 100%);
  }

  .fallback-main {
    font-size: 13px;
    font-weight: 900;
    color: var(--ba-blue-dark);
  }

  .fallback-sub {
    font-size: 10px;
    color: #7994b4;
    font-weight: 700;
  }

  .fallback-pickup_blue {
    background: linear-gradient(135deg, #e6f3ff 0%, #b3d9ff 100%);
  }
  .fallback-pickup_pink {
    background: linear-gradient(135deg, #ffe6ee 0%, #ffb3cc 100%);
  }
  .fallback-select {
    background: linear-gradient(135deg, #fff9e6 0%, #ffe680 100%);
  }

  .selectable-members-btn {
    background: rgba(255, 255, 255, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.9);
    border-radius: 6px;
    padding: 6px 12px;
    font-size: 12px;
    font-weight: 800;
    color: var(--ba-blue-dark);
    cursor: pointer;
    align-self: flex-start;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    transition: background 0.2s;
    margin-top: 10px;
  }

  .selectable-members-btn:hover {
    background: rgba(255, 255, 255, 0.95);
  }

  /* Stage Area */
  .recruit-stage {
    flex: 1;
    position: relative;
    background: #000;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
  }

  .stage-bg-container {
    position: absolute;
    inset: 0;
    z-index: 0;
  }

  .stage-bg-video,
  .stage-bg-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    background-size: cover;
    background-position: center top;
  }

  /* Stage Overlay content styling */
  .stage-overlay {
    position: absolute;
    inset: 0;
    z-index: 5;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-end;
    padding: 30px;
    /* Strong white to transparent gradient from bottom */
    background: linear-gradient(
      to top,
      rgba(255, 255, 255, 1) 0%,
      rgba(255, 255, 255, 0.85) 15%,
      rgba(255, 255, 255, 0) 40%
    );
  }

  .pool-text-info {
    display: flex;
    flex-direction: column;
    text-align: left;
    animation: slide-in 0.4s ease-out;
    margin-bottom: 15px; /* Slight margin to align baseline beautifully with buttons */
  }

  @keyframes slide-in {
    from {
      transform: translateX(-30px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  .pool-title {
    margin: 0;
    font-size: 32px;
    font-weight: 900;
    color: #1f3c6d; /* Dark Blue */
    letter-spacing: 1px;
  }

  .pool-period {
    font-size: 14px;
    color: #506785; /* Dark grey-blue */
    font-weight: 700;
    margin-top: 4px;
  }

  /* Bottom Controls */
  .stage-actions-row {
    display: flex;
    justify-content: flex-end;
    align-items: flex-end;
    gap: 15px;
  }

  .rates-search-btn {
    background: transparent;
    border: none;
    cursor: pointer;
    margin-bottom: 6px;
    margin-right: 5px;
  }

  .rates-btn-box {
    width: 44px;
    height: 40px;
    background: #ffffff;
    border: 1px solid #d0dfee;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #1f3c6d;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    transition:
      background 0.2s,
      transform 0.2s;
  }

  .rates-search-btn:hover .rates-btn-box {
    background: #f0f6fc;
    transform: translateY(-2px);
  }

  /* Gacha button styling */
  .gacha-buttons-wrapper {
    display: flex;
    gap: 12px;
  }

  .gacha-btn {
    width: 190px;
    height: 64px;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    font-family: inherit;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.2);
    transform: skewX(-15deg);
    border-radius: 4px;
    position: relative;
  }

  .gacha-btn-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transform: skewX(15deg);
    width: 100%;
    height: 100%;
  }

  .btn-buy-ticket {
    border: none;
    background: #ffd400; /* Yellow */
  }

  .btn-buy-ticket-top {
    height: 50%;
    background: #251b12; /* Dark Brown */
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    color: #ffffff;
    transform: skewX(15deg);
    width: 120%;
    margin-left: -10%;
    padding: 0 10%;
  }

  .btn-buy-ticket-bottom {
    height: 50%;
    background: #ffd400;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #0e365c; /* Dark blue text */
    transform: skewX(15deg);
    width: 120%;
    margin-left: -10%;
  }

  .btn-use-ticket {
    background: linear-gradient(135deg, #fff96e 0%, #ffcc22 100%);
    border: none;
    color: #4a1a04; /* Dark brown text */
  }

  .btn-use-ticket:hover {
    transform: skewX(-15deg) translateY(-2px);
    box-shadow: 0 8px 18px rgba(255, 204, 34, 0.4);
  }

  .btn-buy-ticket:hover {
    transform: skewX(-15deg) translateY(-2px);
    box-shadow: 0 8px 18px rgba(255, 212, 0, 0.4);
  }

  .gacha-btn-title {
    font-size: 18px;
    font-weight: 900;
    letter-spacing: 1px;
  }

  .gacha-btn-cost {
    font-size: 16px;
    font-weight: 800;
  }

  .btn-cost-wrapper {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .btn-cost-icon {
    width: 18px;
    height: 18px;
    object-fit: contain;
  }

  .gacha-btn:active {
    transform: skewX(-15deg) translateY(1px);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  }

  .btn-single {
    background: linear-gradient(135deg, #7be4ff 0%, #46c4ff 100%);
    border: none;
    width: 220px;
  }
  .btn-single:hover {
    transform: skewX(-15deg) translateY(-2px);
    box-shadow: 0 6px 14px rgba(70, 196, 255, 0.4);
  }
  .btn-single .gacha-cost-pill {
    background: #113854;
    color: #ffffff;
  }
  .btn-single .gacha-btn-title {
    color: #0e365c;
  }

  .btn-multi {
    background: linear-gradient(135deg, #fff96e 0%, #ffcc22 100%);
    border: none;
    width: 220px;
  }
  .btn-multi:hover {
    transform: skewX(-15deg) translateY(-2px);
    box-shadow: 0 6px 14px rgba(255, 204, 34, 0.4);
  }
  .btn-multi .gacha-cost-pill {
    background: #3b1c10;
    color: #ffffff;
  }
  .btn-multi .gacha-btn-title {
    color: #4a1a04;
  }

  .gacha-btn-inner.gacha-classic {
    flex-direction: row;
    justify-content: space-between;
    padding: 0 10px 0 0;
  }

  .gacha-left-icon {
    height: 120%;
    width: 85px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: -5px;
    margin-left: -5px;
    flex-shrink: 0;
  }
  .gacha-left-icon img {
    height: 100%;
    width: 100%;
    object-fit: contain;
  }

  .gacha-right-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
    gap: 2px;
  }

  .gacha-cost-pill {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    width: 110%;
    height: 26px;
    margin-right: -10%;
    margin-top: 4px;
    padding: 0 4px 0 10px;
    font-size: 16px;
    font-weight: 800;
    clip-path: polygon(10px 0, 100% 0, 100% 100%, 0 100%);
    border-radius: 0 4px 4px 0; /* Add rounded corners to the right side */
  }

  .gacha-cost-pill .btn-cost-icon {
    width: 20px;
    height: 20px;
    margin-left: -8px;
    margin-top: -2px;
    transform: scale(1.3);
  }

  .btn-ticket-bubble {
    position: absolute;
    top: -24px;
    left: 20px;
    background: #3b5372;
    color: #ffffff;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 800;
    z-index: 10;
    transform: skewX(15deg); /* Un-skew from parent */
    white-space: nowrap;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }
  .btn-ticket-bubble::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 18px;
    width: 10px;
    height: 10px;
    background: #3b5372;
    transform: rotate(45deg);
    border-radius: 2px;
  }
  .tag-highlight {
    color: #51c9ff;
  }
  /* Modals overlays & dialogs styling */
  .ba-modal-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.55);
    backdrop-filter: blur(4px);
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .animate-pop {
    animation: modal-pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  @keyframes modal-pop {
    from {
      transform: scale(0.9);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }

  .ba-dialog-box {
    width: 360px;
    background: var(--ba-white);
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 12px 36px rgba(0, 0, 0, 0.25);
    border: 2px solid #d0e4f5;
  }

  .ba-dialog-header {
    height: 48px;
    background: #e8f4ff;
    border-bottom: 2px solid #d0e4f5;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    color: var(--ba-blue-dark);
    font-size: 15px;
  }

  .ba-dialog-content {
    padding: 24px;
    font-size: 14px;
    line-height: 1.5;
    text-align: center;
    color: var(--ba-dark);
  }

  .ba-dialog-content .highlight {
    color: var(--ba-blue);
    font-weight: 800;
  }

  .ba-dialog-actions {
    display: flex;
    border-top: 1px solid #e2e8f0;
  }

  .ba-btn-cancel,
  .ba-btn-confirm {
    flex: 1;
    height: 46px;
    border: none;
    font-family: inherit;
    font-weight: 700;
    font-size: 14px;
    cursor: pointer;
    transition: background 0.15s;
  }

  .ba-btn-cancel {
    background: #f8fafc;
    color: #64748b;
    border-right: 1px solid #e2e8f0;
  }

  .ba-btn-cancel:hover {
    background: #f1f5f9;
  }

  .ba-btn-confirm {
    background: var(--ba-blue);
    color: var(--ba-white);
  }

  .ba-btn-confirm:hover {
    background: var(--ba-blue-dark);
  }

  .ba-btn-confirm:disabled {
    background: #cbd5e1;
    color: #94a3b8;
    cursor: not-allowed;
  }

  /* List details Rates modal */
  .ba-list-modal {
    width: 580px;
    max-width: 90vw;
    height: 420px;
    background: var(--ba-white);
    border-radius: 12px;
    border: 2px solid #c0d6e8;
    box-shadow: 0 15px 45px rgba(0, 0, 0, 0.3);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .select-modal {
    height: 480px;
  }

  .ba-modal-header {
    height: 50px;
    background: #f1f7fc;
    border-bottom: 2px solid #c0d6e8;
    padding: 0 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 800;
    font-size: 15px;
    color: var(--ba-dark);
  }

  .ba-modal-close {
    background: transparent;
    border: none;
    color: var(--ba-muted);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    transition:
      background 0.2s,
      color 0.2s;
  }

  .ba-modal-close:hover {
    background: #e2ebf4;
    color: #ff5a5a;
  }

  .ba-modal-body {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
  }

  .ba-rates-summary {
    display: flex;
    flex-direction: column;
    gap: 4px;
    background: #f8fafc;
    padding: 10px 14px;
    border-radius: 8px;
    font-size: 12px;
    color: #64748b;
    margin-bottom: 14px;
    line-height: 1.4;
    text-align: left;
  }

  .ba-rates-table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;
    font-size: 13px;
  }

  .ba-rates-table th {
    padding: 10px;
    background: #e8f2fa;
    color: #1e4e79;
    font-weight: 700;
    border-bottom: 2px solid #c0d6e8;
  }

  .ba-rates-table td {
    padding: 8px 10px;
    border-bottom: 1px solid #e2e8f0;
    color: var(--ba-dark);
  }

  .ba-rates-table tr:hover {
    background: rgba(18, 138, 250, 0.03);
  }

  .td-name {
    font-weight: 700;
  }

  .td-weight,
  .td-prob {
    font-weight: 700;
    color: var(--ba-blue);
  }

  /* Student selection ticket grid view styling */
  .select-desc {
    font-size: 13px;
    color: #64748b;
    text-align: left;
    margin: 0 0 14px;
  }

  .student-select-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 12px;
  }

  .student-select-card {
    position: relative;
    background: #ffffff;
    border: 2px solid #e2e8f0;
    border-radius: 10px;
    padding: 12px;
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.02);
  }

  .student-select-card:hover {
    border-color: var(--ba-blue);
    background: var(--ba-blue-light);
    transform: translateY(-1px);
  }

  .student-select-card.is-selected {
    border-color: var(--ba-blue);
    background: #e1f0ff;
    box-shadow: 0 0 0 3px rgba(18, 138, 250, 0.15);
  }

  .student-avatar-box {
    width: 38px;
    height: 38px;
    background: #e2ebf4;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .student-emoji {
    font-size: 20px;
  }

  .student-info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    min-width: 0;
  }

  .student-select-name {
    font-size: 14px;
    font-weight: 800;
    color: var(--ba-dark);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
  }

  .student-select-school {
    font-size: 10px;
    color: var(--ba-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
  }

  .student-select-tick {
    position: absolute;
    top: 4px;
    right: 6px;
    font-size: 11px;
    font-weight: bold;
    color: var(--ba-blue);
  }

  .ba-modal-footer {
    padding: 12px 16px;
    background: #f1f7fc;
    border-top: 2px solid #c0d6e8;
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  }

  .ba-modal-footer button {
    height: 38px;
    padding: 0 20px;
    border-radius: 6px;
  }

  /* CSS Backup Background animation styling */
  .ba-css-bg {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, #d3eafc 0%, #aed6f8 100%);
    overflow: hidden;
    z-index: 1;
  }

  .ba-bg-grids {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(90deg, rgba(18, 138, 250, 0.05) 1px, transparent 1px),
      linear-gradient(0deg, rgba(18, 138, 250, 0.05) 1px, transparent 1px);
    background-size: 40px 40px;
  }

  .ba-bg-stripes {
    position: absolute;
    inset: -100px;
    background: repeating-linear-gradient(
      -45deg,
      transparent,
      transparent 40px,
      rgba(255, 255, 255, 0.15) 40px,
      rgba(255, 255, 255, 0.15) 80px
    );
    animation: move-stripes 20s linear infinite;
  }

  @keyframes move-stripes {
    0% {
      transform: translate(0, 0);
    }
    100% {
      transform: translate(80px, 80px);
    }
  }

  .ba-bg-shards {
    position: absolute;
    inset: 0;
  }

  .ba-shard {
    position: absolute;
    background: rgba(255, 255, 255, 0.25);
    border-radius: 4px;
    transform: rotate(45deg);
    animation: float-shard 8s ease-in-out infinite;
  }

  .ba-shard-1 {
    width: 40px;
    height: 40px;
    left: 10%;
    top: 20%;
    animation-delay: 0s;
  }
  .ba-shard-2 {
    width: 60px;
    height: 60px;
    right: 15%;
    top: 30%;
    animation-delay: 2s;
  }
  .ba-shard-3 {
    width: 30px;
    height: 30px;
    left: 30%;
    bottom: 15%;
    animation-delay: 4s;
  }
  .ba-shard-4 {
    width: 50px;
    height: 50px;
    right: 25%;
    bottom: 20%;
    animation-delay: 1s;
  }

  @keyframes float-shard {
    0%,
    100% {
      transform: translateY(0) rotate(45deg) scale(1);
      opacity: 0.25;
    }
    50% {
      transform: translateY(-20px) rotate(60deg) scale(1.1);
      opacity: 0.5;
    }
  }

  .ba-bg-rays {
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 100% 0%, rgba(18, 138, 250, 0.15) 0%, transparent 60%);
    animation: pulse-rays 6s ease-in-out infinite;
  }

  @keyframes pulse-rays {
    0%,
    100% {
      opacity: 0.6;
    }
    50% {
      opacity: 1;
    }
  }

  .currency-icon-img {
    width: 20px;
    height: 20px;
    object-fit: contain;
  }

  .btn-cost-wrapper {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .btn-cost-icon {
    width: 16px;
    height: 16px;
    object-fit: contain;
  }

  .video-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #000;
    z-index: 9999;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
  }

  .gacha-video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .skip-hint {
    position: absolute;
    top: 20px;
    right: 20px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 14px;
    background: rgba(0, 0, 0, 0.5);
    padding: 6px 12px;
    border-radius: 4px;
    pointer-events: none;
  }

  .recruit-result-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10000;
    background-image: url('/image/background.png');
    background-size: cover;
    background-position: center;
  }
</style>
