/**
 * Tauri event payload types — matches Serialize structs in src-tauri/src/models.rs.
 */

import type { PickCountDialogConfig, PickResultDialogConfig } from './config'
import type { PickedStudent } from './domain'

export interface PickCountOpenPayload {
  config: PickCountDialogConfig
}

export interface PickResultOpenPayload {
  token: number
  results: PickedStudent[]
  config: PickResultDialogConfig
}

export interface PickResultResetPayload {
  token: number
  reason: string
}

export interface LogEntryEventPayload {
  id?: string
  level: string
  text: string
  time: string | number
}

export interface FloatingConfigUpdatedPayload {
  sizePercent?: number
  transparencyPercent?: number
  alwaysOnTop?: boolean
  mode?: string
  iconPath?: string
  background?: string
  borderRadiusPercent?: number
  clickSoundEnabled?: boolean
  clickSoundPath?: string
  clickSoundVolume?: number
  dragThresholdPx?: number
}
