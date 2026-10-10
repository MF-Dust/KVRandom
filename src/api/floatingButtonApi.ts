import { invoke, listenEvent, type EventCallback, type Unlisten } from './desktopCore'
import type { FloatingButtonConfig, FloatingConfigUpdatedPayload } from '@/types'

export const floatingButtonApi = {
  getConfig: () => invoke<FloatingButtonConfig>('get_floating_button_config'),
  onClick: () => invoke<void>('floating_button_clicked'),
  dragMouse: () => invoke<void>('floating_button_drag_mouse'),
  startDrag: () => invoke<void>('floating_button_drag_start'),
  moveDrag: (dx: number, dy: number) => invoke<void>('floating_button_drag_move', { dx, dy }),
  endDrag: () => invoke<void>('floating_button_drag_end'),
  onConfigUpdated: (callback: EventCallback<FloatingConfigUpdatedPayload>): Unlisten =>
    listenEvent<FloatingConfigUpdatedPayload>('floating-config-updated', callback),
}
