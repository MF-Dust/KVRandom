import { invoke, listenCompat, type EventCallback, type Unlisten } from './tauriCore'

export const pickCountApi = {
  getConfig: () => invoke<unknown>('get_pick_count_config'),
  cancel: () => invoke<void>('cancel_pick_count'),
  confirm: (count: number, playMusic: boolean, source: string | null = null) =>
    invoke<void>('confirm_pick_count', { count, playMusic, source }),
  onOpen: (callback: EventCallback<unknown>): Unlisten => listenCompat('pick-count-open', callback),
  onStopBgm: (callback: EventCallback<unknown>): Unlisten =>
    listenCompat('pick-count-stop-bgm', callback),
}

export type PickCountApi = typeof pickCountApi
