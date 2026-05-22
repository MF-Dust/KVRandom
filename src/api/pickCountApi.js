import { invoke, listenCompat } from './tauriCore'

export const pickCountApi = {
  getConfig: () => invoke('get_pick_count_config'),
  cancel: () => invoke('cancel_pick_count'),
  confirm: (count, playMusic, source = null) => invoke('confirm_pick_count', { count, playMusic, source }),
  onOpen: (callback) => listenCompat('pick-count-open', callback),
  onStopBgm: (callback) => listenCompat('pick-count-stop-bgm', callback)
}
