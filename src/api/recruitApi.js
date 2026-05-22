import { invoke } from './tauriCore'

export const recruitApi = {
  openRecruit: () => invoke('open_recruit'),
  closeRecruit: () => invoke('close_recruit'),
  openConfig: () => invoke('open_config'),
  confirmSelectStudent: (studentName, source) => invoke('confirm_select_student', { studentName, source })
}
