/**
 * Application configuration types. Field names are kept in camelCase to match
 * serde output from the Rust backend (src-tauri/src/config.rs).
 */

import type { Student } from './domain'

export interface FloatingPosition {
  x: number | null
  y: number | null
}

export type FloatingButtonMode = 'simple' | 'full' | string

export interface FloatingButtonConfig {
  sizePercent: number
  transparencyPercent: number
  alwaysOnTop: boolean
  position: FloatingPosition
  mode: FloatingButtonMode
  iconPath: string
  background: string
  borderRadiusPercent: number
  clickSoundEnabled: boolean
  clickSoundPath: string
  clickSoundVolume: number
  dragThresholdPx: number
}

export interface PickCountDialogConfig {
  defaultPlayMusic: boolean
  backgroundDarknessPercent: number
  defaultCount: number
  titleText: string
  minButtonText: string
  maxButtonText: string
  cancelButtonText: string
  confirmButtonText: string
  musicLabelText: string
  rangeHintText: string
  panelBackground: string
  bgmVolume: number
  bgmPaths: string[]
  allowMusicToggle: boolean
  exitAnimationMs: number
}

export interface PickResultDialogConfig {
  defaultPlayGachaSound: boolean
  gachaSoundVolume: number
  gachaSoundPath: string
  backgroundDarknessPercent: number
  blueEnvelopeImage: string
  goldEnvelopeImage: string
  pinkEnvelopeImage: string
  cardSizePercent: number
  flyIntervalMs: number
  revealDelayMs: number
  closeFadeMs: number
  closeHintText: string
  emptyText: string
  confirmButtonText: string
  drawAgainButtonText: string
}

export interface AppearanceConfig {
  themeColor: string
  accentColor: string
  pageBackground: string
  cardRadiusPx: number
  compactMode: boolean
}

export interface RecruitConfig {
  titleText: string
  showCurrencyBar: boolean
  defaultVideoPath: string
  skipHintText: string
  showResultOverlay: boolean
  selectableMembersText: string
  ratesTitleText: string
  selectionTitleText: string
  replenishTitleText: string
  replenishConfirmText: string
  replenishCancelText: string
  apDisplay: string
  creditDisplay: string
  pyroxeneDisplay: string
  recruitTicket10Display: string
  recruitTicket1Display: string
  selectTicketDisplay: string
}

export interface WebConfig {
  adminTopmostEnabled: boolean
  adminAutoStartEnabled: boolean
  adminAutoStartPath: string
  adminAutoStartTaskName: string
}

export type RecruitPoolTabType = 'select' | 'pickup_blue' | 'pickup_pink' | 'pickup_red' | string
export type RecruitGachaType = 'select' | 'gacha' | string

export interface RecruitPool {
  id: string
  name: string
  tabName: string
  tabType: RecruitPoolTabType
  tabAvatar?: string | null
  bgVideo?: string | null
  bgImage?: string | null
  startTime: string
  endTime: string
  gachaType: RecruitGachaType
  description: string
  buttonText1: string
  buttonText2: string
  buttonCost1: string
  buttonCost2: string
}

export interface AppConfig {
  studentList: Student[]
  allowRepeatDraw: boolean
  fontFamily: string
  floatingButton: FloatingButtonConfig
  pickCountDialog: PickCountDialogConfig
  pickResultDialog: PickResultDialogConfig
  appearance: AppearanceConfig
  recruitConfig: RecruitConfig
  webConfig: WebConfig
  recruitPools: RecruitPool[]
}

export interface StudentListParseResult {
  studentList: Student[]
  normalizedText: string
}
