import { invoke, listenCompat, type EventCallback, type Unlisten } from './tauriCore'
import type {
  PickedStudent,
  PickResultDialogConfig,
  PickResultOpenPayload,
  PickResultResetPayload,
} from '@/types'

export const pickResultApi = {
  getResults: () => invoke<PickedStudent[]>('get_pick_results'),
  getConfig: () => invoke<PickResultDialogConfig>('get_pick_result_config'),
  close: () => invoke<void>('close_pick_result'),
  onOpen: (callback: EventCallback<PickResultOpenPayload>): Unlisten =>
    listenCompat<PickResultOpenPayload>('pick-result-open', callback),
  onReset: (callback: EventCallback<PickResultResetPayload>): Unlisten =>
    listenCompat<PickResultResetPayload>('pick-result-reset', callback),
}

export type PickResultApi = typeof pickResultApi
