import { invoke, listenEvent, type EventCallback, type Unlisten } from './tauriCore'
import type {
  AppConfig,
  AppInfo,
  ApiResult,
  LogEntryEventPayload,
  Student,
  StudentListParseResult,
  UpdateResult,
} from '@/types'

export const appApi = {
  getConfig: () => invoke<AppConfig>('get_config'),
  parseStudentListText: (rawText: string, existingStudents: Student[]) =>
    invoke<StudentListParseResult>('parse_student_list_text', { rawText, existingStudents }),
  importStudentListFromFile: (existingStudents: Student[]) =>
    invoke<StudentListParseResult | null>('import_student_list_from_file', { existingStudents }),
  saveConfig: (config: AppConfig) => invoke<void>('save_app_config', { config }),
  getAppInfo: () => invoke<AppInfo>('get_app_info'),
  checkUpdate: () => invoke<UpdateResult>('check_update'),
  requestAdminElevation: () => invoke<ApiResult>('request_admin_elevation'),
  createAdminStartupTask: (exePath: string, taskName: string) =>
    invoke<ApiResult>('create_admin_startup_task', { exePath, taskName }),
  getLogs: () => invoke<LogEntryEventPayload[]>('get_logs'),
  getSystemFonts: () => invoke<string[]>('get_system_fonts'),
  onLogEntry: (callback: EventCallback<LogEntryEventPayload>): Unlisten =>
    listenEvent<LogEntryEventPayload>('log-entry', callback),
  onConfigUpdated: (callback: EventCallback<AppConfig>): Unlisten =>
    listenEvent<AppConfig>('config-updated', callback),
}

export type AppApi = typeof appApi
