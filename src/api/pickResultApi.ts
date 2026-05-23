import { invoke, listenCompat, type EventCallback, type Unlisten } from './tauriCore'

export const pickResultApi = {
  getResults: () => invoke<unknown[]>('get_pick_results'),
  getConfig: () => invoke<unknown>('get_pick_result_config'),
  close: () => invoke<void>('close_pick_result'),
  onOpen: (callback: EventCallback<unknown>): Unlisten =>
    listenCompat('pick-result-open', callback),
  onReset: (callback: EventCallback<unknown>): Unlisten =>
    listenCompat('pick-result-reset', callback),
}

export type PickResultApi = typeof pickResultApi
