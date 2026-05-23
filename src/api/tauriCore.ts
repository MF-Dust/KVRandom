import { invoke as rawInvoke, type InvokeArgs } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'

/**
 * 把后端 AppError 序列化的 `{ kind, message }` 对象规范化回字符串展示。
 * 兼容旧的字符串错误、Error 实例与未知形状。
 */
export function unwrapAppError(error: unknown): string {
  if (typeof error === 'string') return error
  if (error instanceof Error) return error.message
  if (typeof error === 'object' && error !== null) {
    const obj = error as { message?: unknown; kind?: unknown }
    if (typeof obj.message === 'string') return obj.message
    try {
      return JSON.stringify(error)
    } catch {
      return Object.prototype.toString.call(error)
    }
  }
  return String(error)
}

/**
 * Tauri invoke 的应用层包装：保留与 `@tauri-apps/api/core::invoke` 相同的签名，
 * 但在 rejection 时把 AppError 对象转为可读字符串。
 */
export function invoke<T = void>(cmd: string, args?: InvokeArgs): Promise<T> {
  return rawInvoke<T>(cmd, args).catch((error: unknown) => {
    throw new Error(unwrapAppError(error))
  })
}

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
      console.warn(`Failed to listen ${eventName}`, unwrapAppError(error))
    })

  return () => {
    disposed = true
    if (typeof unlisten === 'function') {
      unlisten()
    }
  }
}
