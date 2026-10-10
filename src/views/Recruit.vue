<template>
  <div class="recruit-container">
    <!-- Header Bar -->
    <header class="recruit-header">
      <div class="header-left">
        <button type="button" class="header-back-btn" title="返回" @click="handleExit">
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
        <span class="header-title">{{ recruitConfig.titleText }}</span>
      </div>

      <div class="header-right">
        <!-- AP Currency -->
        <div v-if="recruitConfig.showCurrencyBar" class="currency-item ap-pill">
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
          <span class="currency-val">{{ recruitConfig.apDisplay }}</span>
          <button type="button" class="currency-add-btn" @click="openReplenish('ap')">+</button>
        </div>

        <!-- Credit Currency -->
        <div v-if="recruitConfig.showCurrencyBar" class="currency-item credit-pill">
          <div class="currency-icon-wrapper">
            <img src="/image/credit.png" class="currency-icon-img" alt="Credit" />
          </div>
          <span class="currency-val">{{ recruitConfig.creditDisplay }}</span>
          <button type="button" class="currency-add-btn" @click="openReplenish('credit')">+</button>
        </div>

        <!-- Pyroxene Currency -->
        <div v-if="recruitConfig.showCurrencyBar" class="currency-item pyroxene-pill">
          <div class="currency-icon-wrapper">
            <img src="/image/pyroxene.png" class="currency-icon-img" alt="Pyroxene" />
          </div>
          <span class="currency-val">{{ recruitConfig.pyroxeneDisplay }}</span>
          <button type="button" class="currency-add-btn" @click="openReplenish('pyroxene')">
            +
          </button>
        </div>

        <!-- 10-Draw Recruit Ticket -->
        <div v-if="recruitConfig.showCurrencyBar" class="currency-item ticket10-pill">
          <div class="currency-icon-wrapper">
            <img
              src="/image/recruit_ticket_10.webp"
              class="currency-icon-img"
              alt="10-Draw Ticket"
            />
          </div>
          <span class="currency-val">{{ recruitConfig.recruitTicket10Display }}</span>
          <button type="button" class="currency-add-btn" @click="openReplenish('recruitTicket10')">
            +
          </button>
        </div>

        <!-- 1-Draw Recruit Ticket -->
        <div v-if="recruitConfig.showCurrencyBar" class="currency-item ticket1-pill">
          <div class="currency-icon-wrapper">
            <img src="/image/recruit_ticket_1.webp" class="currency-icon-img" alt="1-Draw Ticket" />
          </div>
          <span class="currency-val">{{ recruitConfig.recruitTicket1Display }}</span>
          <button type="button" class="currency-add-btn" @click="openReplenish('recruitTicket1')">
            +
          </button>
        </div>

        <!-- Selection Ticket -->
        <div v-if="recruitConfig.showCurrencyBar" class="currency-item ticket-pill">
          <div class="currency-icon-wrapper">
            <img
              src="/image/recruit_ticket_1.webp"
              class="currency-icon-img"
              alt="Selection Ticket"
            />
          </div>
          <span class="currency-val">{{ recruitConfig.selectTicketDisplay }}</span>
          <button type="button" class="currency-add-btn" @click="openReplenish('ticket')">+</button>
        </div>

        <!-- Settings Button -->
        <button type="button" class="header-icon-btn" title="设置" @click="handleOpenSettings">
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
        <button type="button" class="header-icon-btn" title="主页" @click="handleExit">
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
              :style="
                pool.tabAvatar ? `background-image: url('${resolveAssetUrl(pool.tabAvatar)}');` : ''
              "
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
        <button
          type="button"
          class="ba-btn ba-btn--sm selectable-members-btn"
          @click="showRatesModal"
        >
          {{ recruitConfig.selectableMembersText }}
        </button>
      </aside>

      <!-- Stage Content -->
      <main class="recruit-stage">
        <!-- Background Layer -->
        <div class="stage-bg-container">
          <video
            v-if="currentPool?.bgVideo"
            ref="stageBgVideoRef"
            :key="currentPool.id + '-video'"
            class="stage-bg-video"
            :autoplay="shouldPlayStageMedia"
            loop
            muted
            playsinline
            preload="metadata"
            @loadedmetadata="syncStageMediaPlayback"
          >
            <source :src="resolveAssetUrl(currentPool.bgVideo)" />
          </video>
          <div
            v-else-if="currentPool?.bgImage"
            class="stage-bg-image"
            :style="`background-image: url('${resolveAssetUrl(currentPool.bgImage)}');`"
          ></div>
          <div v-else class="ba-css-bg">
            <div class="ba-bg-grids"></div>
            <div class="ba-bg-stripes"></div>
            <div class="ba-bg-rays"></div>
            <div class="ba-bg-halo"></div>
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
            <button type="button" class="rates-search-btn" title="成员一览" @click="showRatesModal">
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
                <button type="button" class="gacha-btn btn-single" @click="handleGacha(1)">
                  <div class="gacha-btn-inner gacha-classic">
                    <div class="gacha-left-icon">
                      <img src="/image/recruit_envelope_1.png" alt="1 Draw" />
                    </div>
                    <div class="gacha-right-content">
                      <div class="gacha-cost-pill">
                        <img src="/image/recruit_ticket_1.webp" class="btn-cost-icon" alt="cost" />
                        <span>1</span>
                      </div>
                      <span class="gacha-btn-title">{{
                        currentPool.buttonText1 || '招募1次'
                      }}</span>
                    </div>
                  </div>
                </button>
                <button type="button" class="gacha-btn btn-multi" @click="handleGacha(10)">
                  <div class="gacha-btn-inner gacha-classic">
                    <div class="gacha-left-icon">
                      <img src="/image/recruit_envelope_10.png" alt="10 Draw" />
                    </div>
                    <div class="gacha-right-content">
                      <div class="gacha-cost-pill">
                        <img src="/image/recruit_ticket_10.webp" class="btn-cost-icon" alt="cost" />
                        <span>1</span>
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
                <button
                  type="button"
                  class="gacha-btn btn-multi gacha-btn--bubble"
                  @click="openReplenish('ticket')"
                >
                  <div class="btn-ticket-bubble">
                    距离结束剩余<span class="tag-highlight">32天</span>
                  </div>
                  <div class="gacha-btn-inner gacha-classic">
                    <div class="gacha-left-icon gacha-left-icon--ticket-lg">
                      <img src="/image/select_ticket.png" alt="Buy Ticket" />
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
                </button>

                <!-- Use Ticket (Blue / btn-single style) -->
                <button
                  type="button"
                  class="gacha-btn btn-single"
                  @click="handleOpenSelectionModal"
                >
                  <div class="gacha-btn-inner gacha-classic">
                    <div class="gacha-left-icon gacha-left-icon--ticket-sm">
                      <img src="/image/select_ticket.png" alt="Use Ticket" />
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
                </button>
              </template>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Replenish Dialog -->
    <div v-if="showReplenishDialog" class="ba-modal-overlay">
      <div class="ba-dialog ba-pop-in replenish-dialog" role="dialog" aria-modal="true">
        <header class="ba-dialog__header">
          <h2 class="ba-dialog__title">{{ recruitConfig.replenishTitleText }}</h2>
        </header>
        <div class="ba-dialog__body replenish-body">
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
              class="replenish-note"
              >(需要消耗 30,000,000 信用积分)</small
            >
          </p>
        </div>
        <footer class="ba-dialog__footer">
          <button type="button" class="ba-btn" @click="closeReplenishDialog">
            {{ recruitConfig.replenishCancelText }}
          </button>
          <button type="button" class="ba-btn ba-btn--yellow" @click="confirmReplenish">
            {{ recruitConfig.replenishConfirmText }}
          </button>
        </footer>
      </div>
    </div>

    <!-- Student Details Modal (Rates list) -->
    <div v-if="showDetailsModal" class="ba-modal-overlay">
      <div class="ba-dialog ba-pop-in list-dialog" role="dialog" aria-modal="true">
        <header class="ba-dialog__header">
          <h2 class="ba-dialog__title">{{ recruitConfig.ratesTitleText }}</h2>
          <button
            type="button"
            class="ba-dialog__close"
            aria-label="关闭"
            @click="showDetailsModal = false"
          >
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
        </header>
        <div class="ba-dialog__body">
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
                <th>提升倍数</th>
                <th>预测概率</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="student in sortedStudents" :key="student.name">
                <td class="td-name">{{ student.name }}</td>
                <td>{{ student.academy || '未知' }}</td>
                <td>{{ student.club || '未知' }}</td>
                <td class="td-weight">{{ student.weight.toFixed(1) }}</td>
                <td class="td-boost">
                  <span v-if="getBoostMultiplier(student.name) > 1" class="boost-badge"
                    >{{ getBoostMultiplier(student.name).toFixed(1) }}x</span
                  >
                  <span v-else>-</span>
                </td>
                <td class="td-prob">{{ calculateProb(student.name, student.weight) }}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Student Selection Ticket Modal -->
    <div v-if="showSelectionModal" class="ba-modal-overlay">
      <div class="ba-dialog ba-pop-in list-dialog select-dialog" role="dialog" aria-modal="true">
        <header class="ba-dialog__header">
          <h2 class="ba-dialog__title">{{ recruitConfig.selectionTitleText }}</h2>
          <button
            type="button"
            class="ba-dialog__close"
            aria-label="关闭"
            @click="showSelectionModal = false"
          >
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
        </header>
        <div class="ba-dialog__body">
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
        <footer class="ba-dialog__footer">
          <button type="button" class="ba-btn" @click="showSelectionModal = false">先返回</button>
          <button
            type="button"
            class="ba-btn ba-btn--yellow"
            :disabled="!selectedStudent"
            @click="handleConfirmSelection"
          >
            确认招募！
          </button>
        </footer>
      </div>
    </div>

    <!-- Video Overlay -->
    <div v-if="isPlayingVideo" class="video-overlay" @click="skipVideo">
      <video
        class="gacha-video"
        :src="resolvedRecruitVideoPath"
        autoplay
        playsinline
        preload="metadata"
        @ended="handleVideoEnd"
      ></video>
      <div class="skip-hint">{{ recruitConfig.skipHintText }}</div>
    </div>

    <!-- Recruit Result Overlay -->
    <div
      v-show="showResultOverlay && recruitConfig.showResultOverlay"
      class="recruit-result-overlay"
    >
      <PickResult :is-recruit-mode="true" @draw-again="handleGacha(10)" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, nextTick, onBeforeUnmount, onMounted, watch } from 'vue'
  import { audioApi } from '../api/audioApi'
  import { recruitApi } from '../api/recruitApi'
  import { pickResultApi } from '../api/pickResultApi'
  import { useRecruitFlow } from '../composables/useRecruitFlow'
  import { useRecruitCurrencies } from '../composables/useRecruitCurrencies'
  import { useRecruitPools } from '../composables/useRecruitPools'
  import { useRecruitModals } from '../composables/useRecruitModals'
  import { useRecruitGacha } from '../composables/useRecruitGacha'
  import { resolveAssetUrl } from '../utils/assets'
  import PickResult from './PickResult.vue'

  // Composables
  const {
    pools,
    activePoolIndex,
    students,
    recruitConfig: recruitConfigRaw,
    currentPool,
    sortedStudents,
    getBoostMultiplier,
    calculateProb,
    switchPool,
  } = useRecruitPools()

  const {
    currencies,
    showReplenishDialog,
    replenishTarget,
    saveCurrencies,
    openReplenish,
    closeReplenishDialog,
    confirmReplenish,
  } = useRecruitCurrencies()

  const {
    showDetailsModal,
    showSelectionModal,
    selectedStudent,
    showRatesModal,
    openSelectionModal,
    closeSelectionModal,
    selectStudent,
  } = useRecruitModals(students)

  const { isPlayingVideo, playVideoAndExecute, handleVideoEnd, skipVideo, cancel } =
    useRecruitFlow()

  const autoSkipVideo = computed(() => recruitConfigRaw.value.autoSkipVideo)

  const { showResultOverlay, handleGacha, confirmStudentSelection } = useRecruitGacha(
    students,
    currencies,
    saveCurrencies,
    playVideoAndExecute,
    autoSkipVideo,
    currentPool
  )

  // Local state
  const stageBgVideoRef = ref<HTMLVideoElement | null>(null)
  const pageVisible = ref(document.visibilityState === 'visible')
  const recruitWindowVisible = ref(true)
  let removeRecruitVisibleListener: (() => void) | null = null
  let removePickResultOpenListener: (() => void) | null = null
  let removePickResultResetListener: (() => void) | null = null

  // Computed properties
  const resolvedRecruitVideoPath = computed(() =>
    resolveAssetUrl(recruitConfigRaw.value.defaultVideoPath)
  )
  const shouldPlayStageMedia = computed(
    () =>
      Boolean(currentPool.value?.bgVideo) &&
      !showReplenishDialog.value &&
      !showDetailsModal.value &&
      !showSelectionModal.value &&
      !isPlayingVideo.value &&
      !showResultOverlay.value &&
      recruitWindowVisible.value &&
      pageVisible.value
  )

  // Display formatting - merge with raw config
  const recruitConfig = computed(() => ({
    ...recruitConfigRaw.value,
    apDisplay: currencies.value.ap.toLocaleString(),
    creditDisplay: currencies.value.credit.toLocaleString(),
    pyroxeneDisplay: currencies.value.pyroxene.toLocaleString(),
    recruitTicket1Display: currencies.value.recruitTicket1.toLocaleString(),
    recruitTicket10Display: currencies.value.recruitTicket10.toLocaleString(),
    selectTicketDisplay: currencies.value.selectionTicket.toLocaleString(),
  }))

  // Video control
  const pauseStageVideo = () => {
    stageBgVideoRef.value?.pause()
  }

  const syncStageMediaPlayback = async () => {
    await nextTick()
    const video = stageBgVideoRef.value
    if (!video) return
    if (shouldPlayStageMedia.value) {
      video.play().catch(() => {})
    } else {
      video.pause()
    }
  }

  const handleVisibilityChange = () => {
    pageVisible.value = document.visibilityState === 'visible'
    syncStageMediaPlayback()
  }

  // Watch currentPool changes to sync media
  watch(currentPool, syncStageMediaPlayback, { flush: 'post' })

  // Watch shouldPlayStageMedia changes independently
  watch(shouldPlayStageMedia, syncStageMediaPlayback, { flush: 'post' })

  // Window actions
  const handleExit = async () => {
    cancel()
    audioApi.playClickSoundSafely()
    pauseStageVideo()
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

  // Lifecycle
  onMounted(() => {
    removePickResultOpenListener = pickResultApi.onOpen(() => {
      showResultOverlay.value = true
    })

    removePickResultResetListener = pickResultApi.onReset((payload) => {
      if (payload?.reason === 'close') {
        showResultOverlay.value = false
      }
    })

    document.addEventListener('visibilitychange', handleVisibilityChange)
    removeRecruitVisibleListener = recruitApi.onWindowVisible((visible) => {
      recruitWindowVisible.value = visible
      if (visible) {
        syncStageMediaPlayback()
      } else {
        cancel()
        pauseStageVideo()
      }
    })
  })

  onBeforeUnmount(() => {
    cancel()
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    if (typeof removeRecruitVisibleListener === 'function') {
      removeRecruitVisibleListener()
      removeRecruitVisibleListener = null
    }
    if (typeof removePickResultOpenListener === 'function') {
      removePickResultOpenListener()
      removePickResultOpenListener = null
    }
    if (typeof removePickResultResetListener === 'function') {
      removePickResultResetListener()
      removePickResultResetListener = null
    }
    pauseStageVideo()
  })

  // Wrapper functions for template
  const handleOpenSelectionModal = () => {
    openSelectionModal(currencies)
  }

  const handleConfirmSelection = () => {
    confirmStudentSelection(selectedStudent, closeSelectionModal)
  }
</script>

<style scoped>
  /* ==========================================================================
   Blue Archive recruitment screen
   Shared tokens / buttons / dialogs come from src/styles (global).
   ========================================================================== */

  .recruit-container {
    position: relative;
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: #e3effa;
    color: var(--ba-ink);
    user-select: none;
  }

  /* --------------------------------------------------------------------------
   Top bar
   -------------------------------------------------------------------------- */
  .recruit-header {
    position: relative;
    z-index: 10;
    isolation: isolate;
    flex: none;
    height: 58px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 0 14px;
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.97) 0%,
      rgba(255, 255, 255, 0.86) 100%
    );
    border-bottom: 1px solid var(--ba-line);
    box-shadow: 0 2px 12px rgba(16, 52, 96, 0.12);
  }

  .recruit-header::before {
    content: '';
    position: absolute;
    inset: 0 auto 0 0;
    z-index: -1;
    width: 380px;
    background: var(--ba-hatch);
    -webkit-mask-image: linear-gradient(90deg, #000 0%, transparent 100%);
    mask-image: linear-gradient(90deg, #000 0%, transparent 100%);
    pointer-events: none;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;
    min-width: 0;
  }

  .header-back-btn {
    position: relative;
    isolation: isolate;
    flex: none;
    display: grid;
    place-items: center;
    width: 48px;
    height: 38px;
    border: 0;
    background: transparent;
    color: #ffffff;
    cursor: pointer;
    transition:
      transform 0.15s ease,
      filter 0.15s ease;
  }

  .header-back-btn::before {
    content: '';
    position: absolute;
    inset: 0 3px;
    z-index: -1;
    border-radius: var(--ba-radius-sm);
    background: var(--ba-fill-navy);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.25),
      0 3px 8px rgba(16, 43, 76, 0.3);
    transform: skewX(var(--ba-skew));
  }

  .header-back-btn:hover {
    filter: brightness(1.2);
  }

  .header-back-btn:active {
    transform: scale(0.94);
  }

  .header-title {
    color: var(--ba-ink-strong);
    font-size: 22px;
    font-weight: 900;
    letter-spacing: 0.08em;
    white-space: nowrap;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }

  /* Currency pills */
  .currency-item {
    position: relative;
    isolation: isolate;
    flex: none;
    display: flex;
    align-items: center;
    gap: 6px;
    height: 32px;
    padding: 0 5px 0 12px;
  }

  .currency-item::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    border: 1px solid var(--ba-line);
    border-radius: var(--ba-radius-sm);
    background: rgba(255, 255, 255, 0.92);
    box-shadow: inset 0 -2px 0 rgba(16, 52, 96, 0.06);
    transform: skewX(var(--ba-skew));
  }

  .currency-icon-wrapper {
    flex: none;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
  }

  .currency-icon-img {
    width: 22px;
    height: 22px;
    object-fit: contain;
  }

  .currency-val {
    min-width: 30px;
    padding-right: 2px;
    color: var(--ba-ink-strong);
    font-family: var(--ba-font-num);
    font-size: 15px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    text-align: right;
    white-space: nowrap;
  }

  .currency-add-btn {
    flex: none;
    display: grid;
    place-items: center;
    width: 24px;
    height: 24px;
    padding: 0;
    border: 0;
    border-radius: 4px;
    background: var(--ba-fill-yellow);
    color: var(--ba-ink-strong);
    font-family: inherit;
    font-size: 17px;
    font-weight: 900;
    line-height: 1;
    box-shadow:
      inset 0 -2px 0 rgba(150, 96, 0, 0.25),
      0 1px 3px rgba(16, 43, 76, 0.2);
    cursor: pointer;
    transition:
      transform 0.15s ease,
      filter 0.15s ease;
  }

  .currency-add-btn:hover {
    filter: brightness(1.06);
  }

  .currency-add-btn:active {
    transform: scale(0.9);
  }

  .header-icon-btn {
    flex: none;
    display: grid;
    place-items: center;
    width: 38px;
    height: 38px;
    border: 0;
    border-radius: var(--ba-radius-sm);
    background: transparent;
    color: var(--ba-ink);
    cursor: pointer;
    transition:
      background 0.2s ease,
      color 0.2s ease;
  }

  .header-icon-btn:hover {
    background: var(--ba-blue-soft);
    color: var(--ba-blue);
  }

  .header-back-btn:focus-visible,
  .header-icon-btn:focus-visible,
  .currency-add-btn:focus-visible {
    outline: 2px solid var(--ba-blue);
    outline-offset: 2px;
  }

  /* --------------------------------------------------------------------------
   Workspace
   -------------------------------------------------------------------------- */
  .recruit-workspace {
    flex: 1;
    min-height: 0;
    display: flex;
    gap: 16px;
    padding: 14px 16px 16px;
    overflow: hidden;
    background:
      var(--ba-pattern-cross) -48px -48px / 96px 96px,
      linear-gradient(135deg, #bcd3ee 0%, #dbe8f8 100%);
  }

  /* Banner list */
  .recruit-sidebar {
    z-index: 10;
    flex: none;
    width: 200px;
    min-height: 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 10px;
  }

  .sidebar-tabs-container {
    min-height: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 4px 10px 6px 2px;
    overflow-x: hidden;
    overflow-y: auto;
    scrollbar-width: none;
  }

  .sidebar-tabs-container::-webkit-scrollbar {
    display: none;
  }

  .sidebar-tab-item {
    position: relative;
    flex-shrink: 0;
    height: 64px;
    overflow: hidden;
    border: 2px solid rgba(255, 255, 255, 0.95);
    border-radius: var(--ba-radius-sm);
    background: #ffffff;
    box-shadow: 0 3px 8px rgba(16, 43, 76, 0.18);
    cursor: pointer;
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease,
      border-color 0.2s ease;
  }

  .sidebar-tab-item:not(.is-active):hover {
    transform: translateX(3px);
    box-shadow: 0 6px 14px rgba(16, 43, 76, 0.24);
  }

  .sidebar-tab-item.is-active {
    z-index: 5;
    border-color: #ffe14a;
    box-shadow:
      0 0 0 2px rgba(255, 225, 74, 0.55),
      0 0 16px rgba(255, 214, 0, 0.6),
      0 4px 10px rgba(16, 43, 76, 0.2);
    transform: translateX(6px) scale(1.02);
  }

  .tab-active-glow {
    position: absolute;
    inset: 0;
    opacity: 0;
    background: linear-gradient(100deg, transparent 55%, rgba(255, 244, 170, 0.55) 100%);
    pointer-events: none;
    transition: opacity 0.2s ease;
  }

  .sidebar-tab-item.is-active .tab-active-glow {
    opacity: 1;
  }

  .tab-banner-image {
    width: 100%;
    height: 100%;
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
  }

  .tab-banner-fallback {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1px;
    overflow: hidden;
    background: linear-gradient(135deg, #f0f6fa 0%, #dce7f3 100%);
  }

  .tab-banner-fallback::after {
    content: '';
    position: absolute;
    inset: 0 0 0 auto;
    width: 55%;
    background: repeating-linear-gradient(
      -55deg,
      rgba(255, 255, 255, 0.45) 0 2px,
      transparent 2px 8px
    );
    -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 100%);
    mask-image: linear-gradient(90deg, transparent 0%, #000 100%);
  }

  .fallback-main {
    position: relative;
    z-index: 1;
    color: var(--ba-ink-strong);
    font-size: 14px;
    font-weight: 900;
  }

  .fallback-sub {
    position: relative;
    z-index: 1;
    color: var(--ba-muted);
    font-size: 10px;
    font-style: italic;
    font-weight: 700;
  }

  .fallback-pickup_blue {
    background: linear-gradient(135deg, #e6f3ff 0%, #a9d4ff 100%);
  }

  .fallback-pickup_pink {
    background: linear-gradient(135deg, #ffe6f1 0%, #ffb0cf 100%);
  }

  .fallback-pickup_red {
    background: linear-gradient(135deg, #ffece8 0%, #ffb3a6 100%);
  }

  .fallback-select {
    background: linear-gradient(135deg, #fff9e0 0%, #ffe27a 100%);
  }

  .fallback-gacha {
    background: linear-gradient(135deg, #e9faf1 0%, #b4ead0 100%);
  }

  .selectable-members-btn {
    flex: none;
    align-self: flex-start;
  }

  /* --------------------------------------------------------------------------
   Stage
   -------------------------------------------------------------------------- */
  .recruit-stage {
    position: relative;
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border-radius: var(--ba-radius);
    background: #000000;
    box-shadow:
      0 0 0 2px rgba(255, 255, 255, 0.75),
      0 10px 30px rgba(16, 43, 76, 0.25);
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
    background-position: center top;
    background-size: cover;
  }

  .stage-overlay {
    position: absolute;
    inset: 0;
    z-index: 5;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 20px;
    padding: 30px;
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
    align-items: flex-start;
    min-width: 0;
    margin-bottom: 12px;
    text-align: left;
    animation: slide-in 0.4s ease-out;
  }

  .pool-title {
    margin: 0;
    color: var(--ba-ink-strong);
    font-size: 32px;
    font-weight: 900;
    letter-spacing: 0.04em;
    text-shadow:
      0 0 12px rgba(255, 255, 255, 0.9),
      0 2px 0 rgba(255, 255, 255, 0.8);
  }

  .pool-period {
    position: relative;
    isolation: isolate;
    margin-top: 8px;
    padding: 3px 16px;
    color: #ffffff;
    font-family: var(--ba-font-num);
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.04em;
    white-space: nowrap;
  }

  .pool-period::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    border-radius: var(--ba-radius-xs);
    background: rgba(16, 43, 76, 0.85);
    transform: skewX(var(--ba-skew));
  }

  @keyframes slide-in {
    from {
      opacity: 0;
      transform: translateX(-30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  /* Bottom controls */
  .stage-actions-row {
    flex: none;
    display: flex;
    align-items: flex-end;
    justify-content: flex-end;
    gap: 15px;
  }

  .rates-search-btn {
    margin: 0 5px 8px 0;
    padding: 0;
    border: 0;
    background: transparent;
    cursor: pointer;
  }

  .rates-btn-box {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 46px;
    height: 40px;
    border: 1px solid var(--ba-line);
    border-radius: var(--ba-radius-sm);
    background: #ffffff;
    color: var(--ba-ink-strong);
    box-shadow:
      inset 0 -3px 0 rgba(16, 52, 96, 0.08),
      0 4px 8px rgba(16, 43, 76, 0.12);
    transition:
      background 0.2s ease,
      transform 0.2s ease;
  }

  .rates-search-btn:hover .rates-btn-box {
    background: var(--ba-blue-soft);
    transform: translateY(-2px);
  }

  .rates-search-btn:focus-visible {
    outline: none;
  }

  .rates-search-btn:focus-visible .rates-btn-box {
    box-shadow: 0 0 0 3px var(--ba-blue-glow);
  }

  /* Gacha buttons */
  .gacha-buttons-wrapper {
    display: flex;
    gap: 12px;
  }

  .gacha-btn {
    position: relative;
    width: 220px;
    height: 64px;
    display: flex;
    flex-direction: column;
    padding: 0;
    border: 0;
    border-radius: 4px;
    color: inherit;
    font: inherit;
    cursor: pointer;
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.7),
      0 6px 14px rgba(16, 43, 76, 0.22);
    transform: skewX(-15deg);
    transition:
      transform 0.16s ease,
      box-shadow 0.16s ease;
  }

  .gacha-btn:hover {
    transform: skewX(-15deg) translateY(-2px);
  }

  .gacha-btn:active {
    transform: skewX(-15deg) translateY(1px);
    box-shadow: 0 2px 6px rgba(16, 43, 76, 0.2);
  }

  .gacha-btn:focus-visible {
    outline: 3px solid var(--ba-blue-glow);
    outline-offset: 2px;
  }

  .gacha-btn--bubble {
    overflow: visible;
  }

  .gacha-btn-inner {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transform: skewX(15deg);
  }

  .gacha-btn-inner.gacha-classic {
    flex-direction: row;
    justify-content: space-between;
    padding: 0 10px 0 0;
  }

  .gacha-btn-title {
    font-size: 18px;
    font-weight: 900;
    letter-spacing: 1px;
    white-space: nowrap;
  }

  .btn-single {
    background: linear-gradient(135deg, #7be4ff 0%, #46c4ff 100%);
  }

  .btn-single:hover {
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.7),
      0 6px 14px rgba(70, 196, 255, 0.45);
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
  }

  .btn-multi:hover {
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.7),
      0 6px 14px rgba(255, 204, 34, 0.45);
  }

  .btn-multi .gacha-cost-pill {
    background: #3b1c10;
    color: #ffffff;
  }

  .btn-multi .gacha-btn-title {
    color: #4a1a04;
  }

  .gacha-left-icon {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 85px;
    height: 120%;
    margin-top: -5px;
    margin-left: -5px;
  }

  .gacha-left-icon img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .gacha-left-icon--ticket-lg {
    width: 110px;
    margin-top: -10px;
    margin-left: -15px;
  }

  .gacha-left-icon--ticket-lg img {
    transform: rotate(-5deg);
  }

  .gacha-left-icon--ticket-sm {
    width: 55px;
    margin-top: 0;
    margin-left: 15px;
  }

  .gacha-left-icon--ticket-sm img {
    transform: rotate(-10deg);
  }

  .gacha-right-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
  }

  .gacha-cost-pill {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    width: 110%;
    height: 26px;
    margin-top: 4px;
    margin-right: -10%;
    padding: 0 4px 0 10px;
    border-radius: 0 4px 4px 0;
    font-family: var(--ba-font-num);
    font-size: 16px;
    font-weight: 700;
    clip-path: polygon(10px 0, 100% 0, 100% 100%, 0 100%);
  }

  .gacha-cost-pill .btn-cost-icon {
    width: 20px;
    height: 20px;
    margin-top: -2px;
    margin-left: -8px;
    object-fit: contain;
    transform: scale(1.3);
  }

  .btn-ticket-bubble {
    position: absolute;
    top: -24px;
    left: 20px;
    z-index: 10;
    padding: 4px 12px;
    border-radius: 20px;
    background: var(--ba-ink-strong);
    color: #ffffff;
    font-size: 13px;
    font-weight: 800;
    white-space: nowrap;
    box-shadow: 0 4px 8px rgba(16, 43, 76, 0.3);
    transform: skewX(15deg);
  }

  .btn-ticket-bubble::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 18px;
    width: 10px;
    height: 10px;
    border-radius: 2px;
    background: var(--ba-ink-strong);
    transform: rotate(45deg);
  }

  .tag-highlight {
    color: var(--ba-cyan-light);
  }

  /* Fallback stage backdrop (no video / image configured) */
  .ba-css-bg {
    position: absolute;
    inset: 0;
    z-index: 1;
    overflow: hidden;
    background: linear-gradient(135deg, #d3eafc 0%, #aed6f8 100%);
  }

  .ba-bg-grids {
    position: absolute;
    inset: 0;
    background-image: var(--ba-pattern-cross);
    background-position: -48px -48px;
    background-size: 96px 96px;
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
    transform: translate(24px, 24px);
  }

  .ba-bg-rays {
    position: absolute;
    inset: 0;
    opacity: 0.8;
    background: radial-gradient(circle at 100% 0%, rgba(18, 138, 250, 0.15) 0%, transparent 60%);
  }

  .ba-bg-halo {
    position: absolute;
    top: 14%;
    left: 50%;
    width: 62%;
    aspect-ratio: 3.2 / 1;
    border: 10px solid rgba(255, 255, 255, 0.4);
    border-radius: 50%;
    box-shadow:
      0 0 24px rgba(255, 255, 255, 0.35),
      inset 0 0 24px rgba(255, 255, 255, 0.25);
    transform: translateX(-50%) rotate(-8deg);
  }

  .ba-bg-shards {
    position: absolute;
    inset: 0;
  }

  .ba-shard {
    position: absolute;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.25);
    transform: rotate(45deg);
    animation: shard-float 8s ease-in-out infinite;
  }

  .ba-shard-1 {
    top: 20%;
    left: 10%;
    width: 40px;
    height: 40px;
    animation-delay: 0s;
  }

  .ba-shard-2 {
    top: 30%;
    right: 15%;
    width: 60px;
    height: 60px;
    animation-delay: 2s;
  }

  .ba-shard-3 {
    bottom: 15%;
    left: 30%;
    width: 30px;
    height: 30px;
    animation-delay: 4s;
  }

  .ba-shard-4 {
    right: 25%;
    bottom: 20%;
    width: 50px;
    height: 50px;
    animation-delay: 1s;
  }

  @keyframes shard-float {
    0%,
    100% {
      transform: translateY(0) rotate(45deg);
    }
    50% {
      transform: translateY(-14px) rotate(45deg);
    }
  }

  /* --------------------------------------------------------------------------
   Dialogs (structure from the global .ba-dialog primitive)
   -------------------------------------------------------------------------- */
  .ba-modal-overlay {
    position: absolute;
    inset: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: var(--ba-backdrop);
    backdrop-filter: blur(2px);
  }

  .replenish-dialog {
    width: 420px;
    max-width: 92vw;
  }

  .replenish-body {
    padding: 28px 24px;
    color: var(--ba-ink);
    font-size: 15px;
    line-height: 1.7;
    text-align: center;
  }

  .replenish-body p {
    margin: 0;
  }

  .replenish-body .highlight {
    color: var(--ba-blue-strong);
    font-weight: 800;
  }

  .replenish-note {
    color: var(--ba-subtle);
  }

  .list-dialog {
    width: 640px;
    max-width: 92vw;
    height: 440px;
    max-height: 88vh;
  }

  .select-dialog {
    height: 500px;
  }

  /* Rates table */
  .ba-rates-summary {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 14px;
    padding: 10px 14px;
    border-left: 4px solid var(--ba-blue);
    border-radius: 0 var(--ba-radius-sm) var(--ba-radius-sm) 0;
    background: #ffffff;
    color: var(--ba-muted);
    font-size: 12px;
    line-height: 1.5;
    text-align: left;
  }

  .ba-rates-summary span:first-child {
    color: var(--ba-ink-strong);
    font-size: 13px;
    font-weight: 800;
  }

  .ba-rates-table {
    width: 100%;
    overflow: hidden;
    border: 1px solid var(--ba-line);
    border-radius: var(--ba-radius-sm);
    border-collapse: separate;
    border-spacing: 0;
    background: #ffffff;
    font-size: 13px;
    text-align: left;
  }

  .ba-rates-table th {
    padding: 10px 12px;
    background: var(--ba-fill-navy);
    color: #ffffff;
    font-weight: 700;
    letter-spacing: 0.04em;
  }

  .ba-rates-table td {
    padding: 8px 12px;
    border-top: 1px solid var(--ba-line-soft);
    color: var(--ba-ink);
  }

  .ba-rates-table tbody tr:nth-child(even) {
    background: #f7fafd;
  }

  .ba-rates-table tbody tr:hover {
    background: var(--ba-blue-soft);
  }

  .td-name {
    color: var(--ba-ink-strong);
    font-weight: 800;
  }

  .ba-rates-table .td-weight,
  .ba-rates-table .td-prob {
    color: var(--ba-blue-strong);
    font-family: var(--ba-font-num);
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }

  .td-boost {
    text-align: center;
  }

  .boost-badge {
    position: relative;
    isolation: isolate;
    display: inline-block;
    padding: 1px 10px;
    color: var(--ba-ink-strong);
    font-family: var(--ba-font-num);
    font-size: 12px;
    font-weight: 700;
  }

  .boost-badge::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    border-radius: 3px;
    background: var(--ba-fill-yellow);
    box-shadow: 0 1px 3px rgba(150, 96, 0, 0.3);
    transform: skewX(var(--ba-skew));
  }

  /* Student selection grid */
  .select-desc {
    margin: 0 0 14px;
    color: var(--ba-muted);
    font-size: 13px;
    text-align: left;
  }

  .student-select-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
    gap: 12px;
  }

  .student-select-card {
    position: relative;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    overflow: hidden;
    border: 2px solid var(--ba-line);
    border-radius: var(--ba-radius-sm);
    background: #ffffff;
    box-shadow: 0 2px 4px rgba(16, 52, 96, 0.06);
    cursor: pointer;
    transition:
      border-color 0.16s ease,
      background 0.16s ease,
      transform 0.16s ease,
      box-shadow 0.16s ease;
  }

  .student-select-card:hover {
    border-color: var(--ba-blue-hover);
    box-shadow: 0 4px 10px rgba(16, 52, 96, 0.12);
    transform: translateY(-1px);
  }

  .student-select-card.is-selected {
    border-color: var(--ba-blue);
    background: linear-gradient(135deg, #ffffff 0%, var(--ba-blue-soft) 100%);
    box-shadow: 0 0 0 3px var(--ba-blue-glow);
  }

  .student-avatar-box {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--ba-blue-soft) 0%, #d6e6f6 100%);
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
    width: 100%;
    overflow: hidden;
    color: var(--ba-ink-strong);
    font-size: 14px;
    font-weight: 800;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .student-select-school {
    width: 100%;
    overflow: hidden;
    color: var(--ba-muted);
    font-size: 11px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .student-select-tick {
    position: absolute;
    top: 0;
    right: 0;
    display: grid;
    place-items: center;
    width: 26px;
    height: 22px;
    border-bottom-left-radius: 8px;
    background: var(--ba-blue);
    color: #ffffff;
    font-size: 12px;
    font-weight: 900;
  }

  /* --------------------------------------------------------------------------
   Recruit video & result overlays
   -------------------------------------------------------------------------- */
  .video-overlay {
    position: absolute;
    inset: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #000000;
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
    right: 24px;
    isolation: isolate;
    padding: 6px 18px;
    color: #ffffff;
    font-size: 14px;
    font-weight: 800;
    letter-spacing: 0.1em;
    pointer-events: none;
  }

  .skip-hint::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    border: 1px solid rgba(255, 255, 255, 0.55);
    border-radius: 4px;
    background: rgba(10, 26, 48, 0.55);
    transform: skewX(var(--ba-skew));
  }

  .recruit-result-overlay {
    position: absolute;
    inset: 0;
    z-index: 10000;
    background-image: url('/image/background.png');
    background-position: center;
    background-size: cover;
  }

  /* --------------------------------------------------------------------------
   Narrow windows (window minimum is 960 × 540)
   -------------------------------------------------------------------------- */
  @media (max-width: 1180px) {
    .recruit-header {
      gap: 10px;
    }

    .header-right {
      gap: 6px;
    }

    .currency-item {
      gap: 4px;
      padding-left: 10px;
    }

    .currency-val {
      font-size: 14px;
    }

    .header-icon-btn {
      width: 32px;
    }
  }

  @media (max-width: 1100px) {
    /* Stack the banner info above the buttons instead of squeezing them */
    .stage-overlay {
      flex-direction: column;
      align-items: stretch;
      justify-content: flex-end;
      gap: 32px; /* leaves room for the ticket bubble above the buttons */
      padding: 22px 24px;
    }

    .pool-text-info {
      margin-bottom: 0;
    }

    .stage-actions-row {
      align-self: flex-end;
    }

    .pool-title {
      font-size: 26px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .ba-shard,
    .pool-text-info {
      animation: none;
    }
  }
</style>
