import { invoke, listenCompat } from './tauriCore'

export const appApi = {
  getConfig: () => invoke<any>('get_config'),
  parseStudentListText: (rawText: string, existingStudents: any[]) =>
    invoke<any>('parse_student_list_text', { rawText, existingStudents }),
  importStudentListFromFile: (existingStudents: any[]) =>
    invoke<any>('import_student_list_from_file', { existingStudents }),
  saveConfig: (config: any) => invoke('save_app_config', { config }),
  getAppInfo: () => invoke<any>('get_app_info'),
  checkUpdate: () => invoke<any>('check_update'),
  requestAdminElevation: () => invoke<any>('request_admin_elevation'),
  createAdminStartupTask: (exePath: string, taskName: string) =>
    invoke<any>('create_admin_startup_task', { exePath, taskName }),
  getLogs: () => invoke<any[]>('get_logs'),
  onLogEntry: (callback: (payload: any) => void) => listenCompat('log-entry', callback),
}
