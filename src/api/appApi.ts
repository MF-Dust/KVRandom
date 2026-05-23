import { invoke, listenCompat, type EventCallback, type Unlisten } from './tauriCore'

// Placeholder types until src/types/ is introduced in step 3.
// These keep noImplicitAny silent without claiming precise shapes prematurely.
type AppConfigShape = Record<string, unknown>
type StudentShape = Record<string, unknown>
type AppInfo = Record<string, unknown>
type UpdateInfo = Record<string, unknown>
type LogEntry = Record<string, unknown>

export const appApi = {
  getConfig: () => invoke<AppConfigShape>('get_config'),
  parseStudentListText: (rawText: string, existingStudents: StudentShape[]) =>
    invoke<StudentShape[]>('parse_student_list_text', { rawText, existingStudents }),
  importStudentListFromFile: (existingStudents: StudentShape[]) =>
    invoke<StudentShape[] | null>('import_student_list_from_file', { existingStudents }),
  saveConfig: (config: AppConfigShape) => invoke<void>('save_app_config', { config }),
  getAppInfo: () => invoke<AppInfo>('get_app_info'),
  checkUpdate: () => invoke<UpdateInfo>('check_update'),
  requestAdminElevation: () => invoke<unknown>('request_admin_elevation'),
  createAdminStartupTask: (exePath: string, taskName: string) =>
    invoke<unknown>('create_admin_startup_task', { exePath, taskName }),
  getLogs: () => invoke<LogEntry[]>('get_logs'),
  onLogEntry: (callback: EventCallback<LogEntry>): Unlisten =>
    listenCompat<LogEntry>('log-entry', callback),
}

export type AppApi = typeof appApi
