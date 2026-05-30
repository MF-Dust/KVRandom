import { invoke, listenEvent, type EventCallback, type Unlisten } from './tauriCore'
import type { PickCountDialogConfig, PickCountOpenPayload } from '@/types'

export const pickCountApi = {
  getConfig: () => invoke<PickCountDialogConfig>('get_pick_count_config'),
  cancel: () => invoke<void>('cancel_pick_count'),
  confirm: (count: number, playMusic: boolean, source: string | null = null) =>
    invoke<void>('confirm_pick_count', { count, playMusic, source }),
  onOpen: (callback: EventCallback<PickCountOpenPayload>): Unlisten =>
    listenEvent<PickCountOpenPayload>('pick-count-open', callback),
  onStopBgm: (callback: EventCallback<void>): Unlisten =>
    listenEvent<void>('pick-count-stop-bgm', callback),
}

export type PickCountApi = typeof pickCountApi
