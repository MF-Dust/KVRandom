import { invoke, listenEvent, type EventCallback, type Unlisten } from './tauriCore'

export const recruitApi = {
  openRecruit: () => invoke<void>('open_recruit'),
  closeRecruit: () => invoke<void>('close_recruit'),
  openConfig: () => invoke<void>('open_config'),
  confirmSelectStudent: (
    studentName: string,
    source: string | null = null,
    poolId: string | null = null
  ) => invoke<void>('confirm_select_student', { studentName, source, poolId }),
  onWindowVisible: (callback: EventCallback<boolean>): Unlisten =>
    listenEvent<boolean>('recruit-window-visible', callback),
}

export type RecruitApi = typeof recruitApi
