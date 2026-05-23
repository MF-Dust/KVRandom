import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'

export { invoke }

export type Unlisten = () => void
export type EventCallback<T> = (payload: T) => void

export const listenCompat = <T = unknown>(
  eventName: string,
  callback: EventCallback<T>
): Unlisten => {
  let unlisten: Unlisten | null = null
  let disposed = false

  listen<T>(eventName, (event) => {
    callback(event.payload)
  })
    .then((fn) => {
      if (disposed) {
        fn()
        return
      }
      unlisten = fn
    })
    .catch((error) => {
      console.warn(`Failed to listen ${eventName}`, error)
    })

  return () => {
    disposed = true
    if (typeof unlisten === 'function') {
      unlisten()
    }
  }
}
