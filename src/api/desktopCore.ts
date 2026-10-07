export type Unlisten = () => void
export type EventCallback<T> = (payload: T) => void

type HostMessage = {
  type: 'response' | 'event'
  id?: number
  ok?: boolean
  result?: unknown
  error?: unknown
  event?: string
  payload?: unknown
}

const pending = new Map<
  number,
  { resolve: (value: unknown) => void; reject: (error: Error) => void }
>()
const listeners = new Map<string, Set<EventCallback<unknown>>>()
let nextId = 0

export function unwrapAppError(error: unknown): string {
  if (typeof error === 'string') return error
  if (error instanceof Error) return error.message
  if (typeof error === 'object' && error !== null) {
    const obj = error as { message?: unknown }
    if (typeof obj.message === 'string') return obj.message
    try {
      return JSON.stringify(error)
    } catch {
      return String(error)
    }
  }
  return String(error)
}

window.chrome?.webview?.addEventListener('message', ({ data }: { data: HostMessage }) => {
  if (data.type === 'response' && data.id !== undefined) {
    const request = pending.get(data.id)
    if (!request) return
    pending.delete(data.id)
    if (data.ok) request.resolve(data.result)
    else request.reject(new Error(unwrapAppError(data.error)))
  } else if (data.type === 'event' && data.event) {
    for (const callback of listeners.get(data.event) ?? []) {
      try {
        callback(data.payload)
      } catch (error) {
        console.warn(`Event handler failed for ${data.event}`, error)
      }
    }
  }
})

export function invoke<T = void>(cmd: string, args?: Record<string, unknown>): Promise<T> {
  const bridge = window.chrome?.webview
  if (!window.__KV_DESKTOP__ || !bridge)
    return Promise.reject(new Error('此功能需要在 KVRandom 桌面应用中运行'))
  return new Promise<T>((resolve, reject) => {
    const id = ++nextId
    pending.set(id, { resolve: (result) => resolve(result as T), reject })
    try {
      bridge.postMessage({ type: 'invoke', id, cmd, args: args ?? {} })
    } catch (error) {
      pending.delete(id)
      reject(new Error(unwrapAppError(error)))
    }
  })
}

export function listenEvent<T = unknown>(eventName: string, callback: EventCallback<T>): Unlisten {
  let subscribers = listeners.get(eventName)
  if (!subscribers) {
    subscribers = new Set()
    listeners.set(eventName, subscribers)
  }
  subscribers.add(callback as EventCallback<unknown>)
  return () => {
    subscribers.delete(callback as EventCallback<unknown>)
    if (subscribers.size === 0) listeners.delete(eventName)
  }
}

// Sent after mount: native windows do not emit open events before Vue subscribes.
export function notifyRendererReady(): void {
  window.chrome?.webview?.postMessage({ type: 'ready' })
}
