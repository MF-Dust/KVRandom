import { invoke } from './tauriCore'

export const recruitApi = {
  openRecruit: () => invoke<void>('open_recruit'),
  closeRecruit: () => invoke<void>('close_recruit'),
  openConfig: () => invoke<void>('open_config'),
  confirmSelectStudent: (studentName: string, source: string | null = null) =>
    invoke<void>('confirm_select_student', { studentName, source }),
}

export type RecruitApi = typeof recruitApi
