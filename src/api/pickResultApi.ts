import { invoke, listenCompat } from './tauriCore'

export const pickResultApi = {
  getResults: () => invoke<any[]>('get_pick_results'),
  getConfig: () => invoke<any>('get_pick_result_config'),
  close: () => invoke('close_pick_result'),
  onOpen: (callback: (payload: any) => void) => listenCompat('pick-result-open', callback),
  onReset: (callback: (payload: any) => void) => listenCompat('pick-result-reset', callback),
}
