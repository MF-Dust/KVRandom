import { invoke, listenCompat, type EventCallback, type Unlisten } from './tauriCore'
import type { FloatingButtonConfig, FloatingConfigUpdatedPayload } from '@/types'

export const floatingButtonApi = {
  getConfig: () => invoke<FloatingButtonConfig>('get_floating_button_config'),
  onClick: () => invoke<void>('floating_button_clicked'),
  startDrag: () => invoke<void>('floating_button_drag_start'),
  moveDrag: (dx: number, dy: number) => invoke<void>('floating_button_drag_move', { dx, dy }),
  endDrag: () => invoke<void>('floating_button_drag_end'),
  prewarmAuxWindows: () => invoke<void>('prewarm_aux_windows'),
  setIgnoreMouseEvents: (ignore: boolean) =>
    invoke<void>('floating_button_set_ignore_mouse', { ignore }),
  onConfigUpdated: (callback: EventCallback<FloatingConfigUpdatedPayload>): Unlisten =>
    listenCompat<FloatingConfigUpdatedPayload>('floating-config-updated', callback),
}

export type FloatingButtonApi = typeof floatingButtonApi
