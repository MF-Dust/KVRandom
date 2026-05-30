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
