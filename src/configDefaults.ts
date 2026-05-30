import type { AppConfig } from '@/types'

export const DEFAULT_ADMIN_TASK_NAME = 'KVRandom (Admin)'

export const MIN_PICK_COUNT = 1
export const MAX_PICK_COUNT = 10

export const DEFAULT_FLOATING_SIZE_PERCENT = 100
export const DEFAULT_FLOATING_TRANSPARENCY_PERCENT = 20
export const DEFAULT_BACKGROUND_DARKNESS_PERCENT = 50
export const DEFAULT_PICK_COUNT = 1
export const DEFAULT_PLAY_MUSIC = false
export const DEFAULT_PLAY_GACHA_SOUND = true
export const DEFAULT_GACHA_SOUND_VOLUME = 0.6
export const DEFAULT_BGM_VOLUME = 0.3
export const DEFAULT_PICK_EXIT_ANIMATION_MS = 400
export const DEFAULT_RESULT_FLY_INTERVAL_MS = 80
export const DEFAULT_RESULT_REVEAL_DELAY_MS = 420
export const DEFAULT_RESULT_CLOSE_FADE_MS = 220

export const createDefaultConfig = (): AppConfig => ({
  studentList: [],
  allowRepeatDraw: true,
  fontFamily: '',
  floatingButton: {
    sizePercent: DEFAULT_FLOATING_SIZE_PERCENT,
    transparencyPercent: DEFAULT_FLOATING_TRANSPARENCY_PERCENT,
    alwaysOnTop: true,
    position: {
      x: null,
      y: null,
    },
    mode: 'full',
    iconPath: '/image/random.svg',
    background: 'linear-gradient(145deg, #66ccff, #4091f0)',
    borderRadiusPercent: 50,
    clickSoundEnabled: true,
    clickSoundPath: 'sound/button_click.wav',
    clickSoundVolume: 1,
    dragThresholdPx: 6,
  },
  pickCountDialog: {
    defaultPlayMusic: DEFAULT_PLAY_MUSIC,
    backgroundDarknessPercent: DEFAULT_BACKGROUND_DARKNESS_PERCENT,
    defaultCount: DEFAULT_PICK_COUNT,
    titleText: '要点名几个人呢～',
    minButtonText: '最少',
    maxButtonText: '最多',
    cancelButtonText: '先不要了',
    confirmButtonText: '开始点名！',
    musicLabelText: '播放超～喜庆的点名BGM！',
    rangeHintText: '可选范围 {min} - {max}，老师看着办～',
    panelBackground: '#eff6ff',
    bgmVolume: DEFAULT_BGM_VOLUME,
    bgmPaths: ['sound/Yuudachi - Blue Archive OST 338.mp3', 'sound/bgm.mp3'],
    allowMusicToggle: true,
    exitAnimationMs: DEFAULT_PICK_EXIT_ANIMATION_MS,
  },
  pickResultDialog: {
    defaultPlayGachaSound: DEFAULT_PLAY_GACHA_SOUND,
    gachaSoundVolume: DEFAULT_GACHA_SOUND_VOLUME,
    gachaSoundPath: 'sound/gacha_loading.ogg',
    backgroundDarknessPercent: 35,
    blueEnvelopeImage: '/image/blue.png',
    goldEnvelopeImage: '/image/gold.png',
    pinkEnvelopeImage: '/image/pink.png',
    cardSizePercent: 100,
    flyIntervalMs: DEFAULT_RESULT_FLY_INTERVAL_MS,
    revealDelayMs: DEFAULT_RESULT_REVEAL_DELAY_MS,
    closeFadeMs: DEFAULT_RESULT_CLOSE_FADE_MS,
    closeHintText: '点一下就关掉哦～',
    emptyText: '还没有点名结果呢～',
    confirmButtonText: '确认',
    drawAgainButtonText: '再次抽取',
  },
  appearance: {
    themeColor: '#128afa',
    accentColor: '#ffd84d',
    pageBackground: 'linear-gradient(160deg, #f0f7ff 0%, #e6f1ff 40%, #f5f9ff 100%)',
    cardRadiusPx: 12,
    compactMode: false,
  },
  recruitConfig: {
    titleText: '招募成员',
    showCurrencyBar: true,
    defaultVideoPath: '/video/vid.mp4',
    skipHintText: '点击跳过 / Click to skip',
    showResultOverlay: true,
    selectableMembersText: '可选的成员',
    ratesTitleText: '成员一览',
    selectionTitleText: '选择成员',
    replenishTitleText: '阿罗娜的补给箱～',
    replenishConfirmText: '确认！',
    replenishCancelText: '先不要了',
    apDisplay: 'INF',
    creditDisplay: 'INF',
    pyroxeneDisplay: 'INF',
    recruitTicket10Display: 'INF',
    recruitTicket1Display: 'INF',
    selectTicketDisplay: 'INF',
  },
  webConfig: {
    adminTopmostEnabled: false,
    adminAutoStartEnabled: false,
    adminAutoStartPath: '',
    adminAutoStartTaskName: DEFAULT_ADMIN_TASK_NAME,
  },
  recruitPools: [],
})
