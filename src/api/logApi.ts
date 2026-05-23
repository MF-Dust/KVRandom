import { invoke } from './tauriCore'

export type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug'

export const logApi = {
  send: (level: LogLevel | string, text: unknown) => {
    const safeText = String(text ?? '').slice(0, 800)
    if (!safeText) return
    invoke('renderer_log', { level, text: safeText }).catch(() => {})
  },
}

export type LogApi = typeof logApi
