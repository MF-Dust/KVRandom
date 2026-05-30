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
}

export interface PickCountDialogConfig {
  defaultPlayMusic: boolean
  backgroundDarknessPercent: number
  defaultCount: number
}

export interface PickResultDialogConfig {
  defaultPlayGachaSound: boolean
  gachaSoundVolume: number
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
  webConfig: WebConfig
  recruitPools: RecruitPool[]
}

export interface StudentListParseResult {
  studentList: Student[]
  normalizedText: string
}
