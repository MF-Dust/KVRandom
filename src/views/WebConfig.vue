<template>
  <n-config-provider :theme-overrides="naiveTheme">
    <main
      class="ba-page ba-themed"
      :class="{ 'is-compact': config.appearance.compactMode }"
      :style="pageStyle"
    >
      <!-- Blue Archive menu backdrop: crosshair grid, hatching, halo and shards -->
      <div class="ba-backdrop" aria-hidden="true">
        <div class="ba-backdrop-grid"></div>
        <div class="ba-backdrop-stripes"></div>
        <div class="ba-backdrop-halo"></div>
        <span class="ba-backdrop-shard ba-backdrop-shard-1"></span>
        <span class="ba-backdrop-shard ba-backdrop-shard-2"></span>
        <span class="ba-backdrop-shard ba-backdrop-shard-3"></span>
      </div>

      <div class="ba-shell">
        <!-- Sidebar -->
        <aside class="ba-sidebar">
          <div class="ba-sidebar-brand">
            <h1 class="ba-brand-title"><span>KV</span>Random</h1>
            <p class="ba-brand-caption">阿罗娜的设置面板～</p>
          </div>

          <ConfigTabs :active-tab="activeTab" :tab-groups="tabGroups" @switch-tab="switchTab" />

          <div class="ba-sidebar-footer">
            <button
              type="button"
              class="ba-btn ba-btn--yellow ba-btn--shine ba-btn--block ba-save-btn"
              title="保存设置"
              @click="saveConfig"
            >
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                stroke-width="2.2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              <span class="ba-save-label">保存设置！</span>
            </button>
          </div>
        </aside>

        <!-- Main content area -->
        <div class="ba-main">
          <header class="ba-content-header">
            <div class="ba-title-row">
              <h2 class="ba-content-title">{{ currentTabTitle }}</h2>
              <span v-if="currentTabSubtitle" class="ba-content-subtitle">
                {{ currentTabSubtitle }}
              </span>
            </div>
            <div class="ba-arona-tip">
              <span class="ba-arona-avatar" aria-hidden="true">
                <img src="/image/Arona_Empty.webp" alt="" />
              </span>
              <p class="ba-arona-bubble">
                <span class="ba-name-tag">阿罗娜</span>
                <span class="ba-arona-text">{{ currentTabHint }}</span>
              </p>
            </div>
          </header>

          <!-- Scrollable content -->
          <form id="config-form" class="ba-content-body" @submit.prevent="saveConfig">
            <div v-if="activeTab === 'list'" key="list" class="ba-tab-content">
              <StudentImportPanel
                v-model:raw-list-text="rawListText"
                :student-count="config.studentList.length"
                @schedule-sync="scheduleTextSync"
                @import-file="handleFileImport"
              />
            </div>

            <div v-else-if="activeTab === 'students'" key="students" class="ba-tab-content">
              <StudentManagerPanel
                @remove-student="removeStudent"
                @reset-weights="resetWeights"
                @add-students="addStudents"
              />
            </div>

            <div v-else-if="activeTab === 'floating'" key="floating" class="ba-tab-content">
              <FloatingSettingsPanel />
            </div>

            <div v-else-if="activeTab === 'appearance'" key="appearance" class="ba-tab-content">
              <AppearanceSettingsPanel />
            </div>

            <div v-else-if="activeTab === 'pickCount'" key="pickCount" class="ba-tab-content">
              <PickSettingsPanel />
            </div>

            <div v-else-if="activeTab === 'pickResult'" key="pickResult" class="ba-tab-content">
              <ResultSettingsPanel />
            </div>

            <div
              v-else-if="activeTab === 'recruitGlobal'"
              key="recruitGlobal"
              class="ba-tab-content"
            >
              <RecruitGlobalSettingsPanel />
            </div>

            <div v-else-if="activeTab === 'recruitPools'" key="recruitPools" class="ba-tab-content">
              <RecruitPoolsSettingsPanel />
            </div>

            <div v-else-if="activeTab === 'web'" key="web" class="ba-tab-content">
              <SystemSettingsPanel
                :update-state="updateState"
                @request-admin-elevation="requestAdminElevation"
                @create-admin-startup-task="createAdminStartupTask"
                @check-update="checkUpdate"
              />
            </div>

            <div v-else-if="activeTab === 'about'" key="about" class="ba-tab-content">
              <AboutSettingsPanel
                :app-version="appVersion"
                :is-admin="isAdmin"
                :is-debug-mode="isDebugMode"
              />
            </div>
          </form>

          <!-- Collapsible log panel -->
          <RuntimeLogPanel
            :logs="logs"
            :is-debug-mode="isDebugMode"
            :is-admin="isAdmin"
            :app-version="appVersion"
          />
        </div>
      </div>
    </main>
  </n-config-provider>
</template>

<script setup lang="ts">
  import { computed, defineAsyncComponent, onBeforeUnmount, onMounted } from 'vue'
  import { NConfigProvider } from 'naive-ui'
  import ConfigTabs from '../components/config/ConfigTabs.vue'
  import RuntimeLogPanel from '../components/config/RuntimeLogPanel.vue'
  import { appApi } from '../api/appApi'
  import { useAppConfig } from '../composables/useAppConfig'
  import { useConfigTabs } from '../composables/useConfigTabs'
  import { provideConfigModel } from '../composables/useConfigModel'
  import { useLogStream } from '../composables/useLogStream'
  import { useStudentListSync } from '../composables/useStudentListSync'
  import { useUpdateCheck } from '../composables/useUpdateCheck'
  import { createNaiveThemeOverrides } from '../theme/naiveTheme'

  const AboutSettingsPanel = defineAsyncComponent(
    () => import('../components/config/AboutSettingsPanel.vue')
  )
  const AppearanceSettingsPanel = defineAsyncComponent(
    () => import('../components/config/AppearanceSettingsPanel.vue')
  )
  const FloatingSettingsPanel = defineAsyncComponent(
    () => import('../components/config/FloatingSettingsPanel.vue')
  )
  const PickSettingsPanel = defineAsyncComponent(
    () => import('../components/config/PickSettingsPanel.vue')
  )
  const RecruitGlobalSettingsPanel = defineAsyncComponent(
    () => import('../components/config/RecruitGlobalSettingsPanel.vue')
  )
  const RecruitPoolsSettingsPanel = defineAsyncComponent(
    () => import('../components/config/RecruitPoolsSettingsPanel.vue')
  )
  const ResultSettingsPanel = defineAsyncComponent(
    () => import('../components/config/ResultSettingsPanel.vue')
  )
  const StudentImportPanel = defineAsyncComponent(
    () => import('../components/config/StudentImportPanel.vue')
  )
  const StudentManagerPanel = defineAsyncComponent(
    () => import('../components/config/StudentManagerPanel.vue')
  )
  const SystemSettingsPanel = defineAsyncComponent(
    () => import('../components/config/SystemSettingsPanel.vue')
  )

  const { tabGroups, activeTab, switchTab, getActiveTabMeta } = useConfigTabs()
  const { logs, addLog, startLogStream, stopLogStream } = useLogStream(appApi)
  const {
    config,
    isDebugMode,
    isAdmin,
    appVersion,
    fetchConfig,
    fetchAppInfo,
    saveConfig: saveCurrentConfig,
    requestAdminElevation,
    createAdminStartupTask,
  } = useAppConfig(appApi, addLog)

  provideConfigModel(config)

  const {
    rawListText,
    syncTextToList,
    scheduleTextSync,
    removeStudent,
    addStudents,
    resetWeights,
    handleFileImport,
    stopTextSync,
  } = useStudentListSync(appApi, config, addLog)

  const { updateState, checkUpdate } = useUpdateCheck(appApi, addLog)

  const saveConfig = () => saveCurrentConfig(syncTextToList)

  const activeTabMeta = computed(() => getActiveTabMeta())
  const currentTabTitle = computed(() => activeTabMeta.value?.title || '设置')
  const currentTabSubtitle = computed(() => activeTabMeta.value?.subtitle || '')
  const currentTabHint = computed(
    () => activeTabMeta.value?.hint || '老师，这里可以调整各项设置哦～'
  )

  // Brand colours feed the CSS tokens; derived shades are computed by `.ba-themed`.
  const pageStyle = computed(() => ({
    '--ba-blue': config.value.appearance.themeColor,
    '--ba-yellow': config.value.appearance.accentColor,
    '--ba-card-radius': `${config.value.appearance.cardRadiusPx}px`,
    background: config.value.appearance.pageBackground,
  }))

  // Naive UI controls follow the same configurable theme colour.
  const naiveTheme = computed(() => createNaiveThemeOverrides(config.value.appearance.themeColor))

  onMounted(() => {
    fetchConfig(rawListText)
    startLogStream()
    fetchAppInfo()
  })

  onBeforeUnmount(() => {
    stopTextSync()
    stopLogStream()
  })
</script>

<style scoped>
  /* ============================================
   Blue Archive settings page shell
   ============================================ */

  .ba-page {
    --ba-sidebar-w: 232px;
    position: relative;
    height: 100vh;
    overflow: hidden;
    color: var(--ba-ink);
    background: linear-gradient(160deg, #f0f7ff 0%, #e6f1ff 40%, #f5f9ff 100%);
  }

  /* ---- Decorative backdrop ---- */
  .ba-backdrop {
    position: absolute;
    inset: 0;
    z-index: 0;
    overflow: hidden;
    pointer-events: none;
  }

  .ba-backdrop-grid {
    position: absolute;
    inset: 0;
    background-image: var(--ba-pattern-cross);
    background-position: -48px -48px;
    background-size: 96px 96px;
    -webkit-mask-image: linear-gradient(180deg, #000 0%, rgba(0, 0, 0, 0.35) 100%);
    mask-image: linear-gradient(180deg, #000 0%, rgba(0, 0, 0, 0.35) 100%);
  }

  .ba-backdrop-stripes {
    position: absolute;
    top: -40px;
    right: -80px;
    width: 560px;
    height: 280px;
    background: repeating-linear-gradient(
      -55deg,
      color-mix(in srgb, var(--ba-blue) 10%, transparent) 0 3px,
      transparent 3px 14px
    );
    -webkit-mask-image: radial-gradient(ellipse at top right, #000 0%, transparent 70%);
    mask-image: radial-gradient(ellipse at top right, #000 0%, transparent 70%);
  }

  .ba-backdrop-halo {
    position: absolute;
    right: -150px;
    bottom: 50px;
    width: 580px;
    height: 190px;
    border: 12px solid color-mix(in srgb, var(--ba-blue) 8%, transparent);
    border-radius: 50%;
    transform: rotate(-14deg);
  }

  .ba-backdrop-halo::after {
    content: '';
    position: absolute;
    top: -150px;
    bottom: -150px;
    left: 46%;
    width: 4px;
    background: linear-gradient(
      180deg,
      transparent 0%,
      color-mix(in srgb, var(--ba-blue) 12%, transparent) 50%,
      transparent 100%
    );
    transform: rotate(32deg);
  }

  .ba-backdrop-shard {
    position: absolute;
    background: color-mix(in srgb, var(--ba-cyan) 16%, transparent);
    clip-path: polygon(50% 100%, 0 0, 100% 0);
  }

  .ba-backdrop-shard-1 {
    top: 18%;
    right: 20%;
    width: 120px;
    height: 104px;
  }

  .ba-backdrop-shard-2 {
    top: 54%;
    right: 5%;
    width: 72px;
    height: 62px;
  }

  .ba-backdrop-shard-3 {
    bottom: -36px;
    left: 42%;
    width: 160px;
    height: 138px;
    clip-path: polygon(50% 0, 0 100%, 100% 100%);
  }

  /* ---- Shell grid ---- */
  .ba-shell {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: var(--ba-sidebar-w) minmax(0, 1fr);
    height: 100vh;
  }

  /* ============================================
   Sidebar
   ============================================ */
  .ba-sidebar {
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-height: 0;
    padding: 16px 12px 14px;
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.97) 0%,
      rgba(255, 255, 255, 0.9) 100%
    );
    border-right: 1px solid var(--ba-line);
    box-shadow: 4px 0 18px rgba(16, 52, 96, 0.06);
  }

  .ba-sidebar-brand {
    position: relative;
    isolation: isolate;
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 4px 10px 14px;
    border-bottom: 1px solid var(--ba-line-soft);
  }

  .ba-sidebar-brand::before {
    content: '';
    position: absolute;
    inset: -16px -12px 0;
    z-index: -1;
    background: var(--ba-hatch);
    -webkit-mask-image: linear-gradient(200deg, #000 0%, transparent 55%);
    mask-image: linear-gradient(200deg, #000 0%, transparent 55%);
  }

  .ba-brand-title {
    margin: 0;
    white-space: nowrap;
    color: var(--ba-ink-strong);
    font-family: var(--ba-font-num);
    font-size: 22px;
    font-style: italic;
    font-weight: 700;
    line-height: 1.2;
    letter-spacing: 0.02em;
  }

  .ba-brand-title::before {
    content: '';
    display: inline-block;
    width: 6px;
    height: 20px;
    margin-right: 14px;
    vertical-align: -3px;
    border-radius: 2px;
    background: var(--ba-blue);
    box-shadow: 5px 0 0 -1px var(--ba-yellow);
    transform: skewX(var(--ba-skew));
  }

  .ba-brand-title span {
    color: var(--ba-blue);
  }

  .ba-brand-caption {
    margin: 0 0 0 16px;
    color: var(--ba-subtle);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.06em;
  }

  .ba-sidebar-footer {
    padding-top: 12px;
    border-top: 1px solid var(--ba-line-soft);
  }

  .ba-save-btn {
    min-height: 48px;
    font-size: 15px;
  }

  /* ============================================
   Main content area
   ============================================ */
  .ba-main {
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
  }

  .ba-content-header {
    position: relative;
    isolation: isolate;
    flex-shrink: 0;
    padding: 18px 28px 14px;
    overflow: hidden;
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.96) 0%,
      rgba(255, 255, 255, 0.8) 100%
    );
    border-bottom: 1px solid var(--ba-line);
  }

  .ba-content-header::before {
    content: '';
    position: absolute;
    inset: 0 0 0 auto;
    z-index: -1;
    width: 42%;
    background: var(--ba-hatch);
    -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 100%);
    mask-image: linear-gradient(90deg, transparent 0%, #000 100%);
  }

  .ba-content-header::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 24px;
    width: 128px;
    height: 3px;
    border-radius: 2px;
    background: linear-gradient(90deg, var(--ba-blue) 0%, var(--ba-cyan) 100%);
    transform: skewX(var(--ba-skew));
  }

  .ba-title-row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px 16px;
  }

  .ba-content-title {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 0;
    color: var(--ba-ink-strong);
    font-size: 24px;
    font-weight: 900;
    line-height: 1.25;
    letter-spacing: 0.02em;
  }

  .ba-content-title::before {
    content: '';
    flex: none;
    width: 8px;
    height: 26px;
    border-radius: 2px;
    background: linear-gradient(180deg, var(--ba-blue-hover) 0%, var(--ba-blue) 100%);
    box-shadow: 6px 0 0 -2px var(--ba-yellow);
    transform: skewX(var(--ba-skew));
  }

  .ba-content-subtitle {
    color: color-mix(in srgb, var(--ba-blue) 55%, var(--ba-subtle));
    font-family: var(--ba-font-num);
    font-size: 13px;
    font-style: italic;
    font-weight: 700;
    letter-spacing: 0.2em;
    text-transform: uppercase;
  }

  .ba-arona-tip {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 10px;
  }

  .ba-arona-avatar {
    flex: none;
    width: 40px;
    height: 40px;
    overflow: hidden;
    border: 2px solid #ffffff;
    border-radius: 50%;
    background: var(--ba-blue-soft);
    box-shadow:
      0 0 0 2px var(--ba-blue-tint),
      0 2px 6px rgba(16, 52, 96, 0.16);
  }

  .ba-arona-avatar img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transform: scale(2.1);
    transform-origin: 50% 69%;
  }

  .ba-arona-bubble {
    position: relative;
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
    margin: 0;
    padding: 6px 14px 6px 8px;
    border: 1px solid var(--ba-line);
    border-radius: 8px;
    background: #ffffff;
    box-shadow: var(--ba-shadow-sm);
    color: var(--ba-muted);
    font-size: 13px;
    line-height: 1.5;
  }

  .ba-arona-bubble::before {
    content: '';
    position: absolute;
    top: 50%;
    left: -6px;
    width: 10px;
    height: 10px;
    border-bottom: 1px solid var(--ba-line);
    border-left: 1px solid var(--ba-line);
    background: #ffffff;
    transform: translateY(-50%) rotate(45deg);
  }

  /* Scrollable form body */
  .ba-content-body {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 20px 28px 24px;
    scrollbar-width: thin;
    scrollbar-color: #bcd4ec transparent;
  }

  .ba-content-body::-webkit-scrollbar {
    width: 6px;
  }

  .ba-content-body::-webkit-scrollbar-thumb {
    border-radius: 3px;
    background: #bcd4ec;
  }

  .ba-content-body::-webkit-scrollbar-thumb:hover {
    background: #8fc2f2;
  }

  .ba-tab-content {
    animation: ba-fade-up 0.3s ease;
  }

  /* ---- Compact appearance ---- */
  .ba-page.is-compact .ba-content-header {
    padding: 12px 22px 10px;
  }

  .ba-page.is-compact .ba-arona-tip {
    margin-top: 6px;
  }

  .ba-page.is-compact .ba-content-body {
    padding: 14px 20px 18px;
  }

  /* ============================================
   Responsive
   ============================================ */
  @media (max-width: 768px) {
    .ba-page {
      --ba-sidebar-w: 68px;
    }

    .ba-sidebar {
      padding: 14px 8px;
    }

    .ba-sidebar-brand,
    .ba-save-label,
    .ba-content-subtitle {
      display: none;
    }

    .ba-save-btn {
      padding: 0;
    }

    .ba-content-header {
      padding: 14px 18px 12px;
    }

    .ba-content-body {
      padding: 14px 18px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .ba-tab-content {
      animation: none;
    }
  }
</style>
