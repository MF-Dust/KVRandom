/**
 * API command input/output types. Names mirror #[tauri::command] signatures
 * in src-tauri/src/commands.rs (will be split into src-tauri/src/commands/* in step 4).
 */

import type {
  AppConfig,
  FloatingButtonConfig,
  PickCountDialogConfig,
  PickResultDialogConfig,
  StudentListParseResult,
} from './config'
import type { PickedStudent, Student, ApiResult } from './domain'

// ---------- App / system ----------

export interface AppInfo {
  version: string
  isDebugMode: boolean
  isAdmin: boolean
  exePath: string
}

export interface UpdateResult {
  ok: boolean
  status: 'idle' | 'loading' | 'ok' | 'update' | 'easter' | 'error' | string
  title: string
  detail: string
  commitUrl?: string
  releaseUrl?: string
  localVersion: string
  remoteVersion?: string
  debug: string[]
}

// ---------- Floating button ----------

export interface FloatingDragMoveArgs {
  dx: number
  dy: number
}

export interface FloatingIgnoreMouseArgs {
  ignore: boolean
}

// ---------- Pick count ----------

export type PickCountSource = string | null

export interface ConfirmPickCountArgs {
  count: number
  playMusic: boolean
  source?: PickCountSource
}

// ---------- Audio ----------

export interface PlayGachaSoundArgs {
  volume: number
}

// ---------- Config / list ----------

export interface ParseStudentListTextArgs {
  rawText: string
  existingStudents: Student[]
}

export interface ImportStudentListFromFileArgs {
  existingStudents: Student[]
}

export interface SaveAppConfigArgs {
  config: AppConfig
}

// ---------- Admin / startup ----------

export interface CreateAdminStartupTaskArgs {
  exePath: string
  taskName: string
}

// ---------- Logs ----------

export interface RendererLogArgs {
  level: string
  text: string
}

// ---------- Recruit ----------

export interface ConfirmSelectStudentArgs {
  studentName: string
  source?: PickCountSource
}

// Re-exports useful for API modules
export type {
  AppConfig,
  FloatingButtonConfig,
  PickCountDialogConfig,
  PickResultDialogConfig,
  StudentListParseResult,
  PickedStudent,
  Student,
  ApiResult,
}
