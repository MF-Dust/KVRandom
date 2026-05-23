import { invoke, listenCompat } from './tauriCore'

export const pickCountApi = {
  getConfig: () => invoke<any>('get_pick_count_config'),
  cancel: () => invoke('cancel_pick_count'),
  confirm: (count: number, playMusic: boolean, source: string | null = null) => invoke('confirm_pick_count', { count, playMusic, source }),
  onOpen: (callback: (payload: any) => void) => listenCompat('pick-count-open', callback),
  onStopBgm: (callback: (payload: any) => void) => listenCompat('pick-count-stop-bgm', callback)
}
