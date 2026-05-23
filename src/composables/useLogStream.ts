import { ref } from 'vue'
import type { AppApi } from '../api/appApi'
import type { LogEntryEventPayload, LogLevel } from '@/types'

export interface UiLogEntry {
  id: string
  level: string
  text: string
  time: string
}

export type AddLog = (level: LogLevel | string, text: string, timeOverride?: string) => void

export function useLogStream(appApi: AppApi) {
  const logs = ref<UiLogEntry[]>([])
  let logSeed = 0
  let removeLogListener: (() => void) | null = null

  const addLog: AddLog = (level, text, timeOverride) => {
    const time = timeOverride || new Date().toLocaleTimeString('zh-CN', { hour12: false })
    logs.value.push({ id: `${Date.now()}-${logSeed++}`, level, text, time })
    if (logs.value.length > 200) {
      logs.value.splice(0, logs.value.length - 200)
    }
  }

  const startLogStream = async () => {
    if (typeof removeLogListener === 'function') {
      removeLogListener()
    }

    try {
      const existingLogs = await appApi.getLogs()
      existingLogs.forEach((entry: LogEntryEventPayload) => {
        const time = entry.time
          ? new Date(entry.time).toLocaleTimeString('zh-CN', { hour12: false })
          : undefined
        addLog(entry.level || 'info', entry.text || '', time)
      })
    } catch (_error) {}

    removeLogListener = appApi.onLogEntry((entry) => {
      try {
        const time = entry.time
          ? new Date(entry.time).toLocaleTimeString('zh-CN', { hour12: false })
          : undefined
        addLog(entry.level || 'info', entry.text || '', time)
      } catch (_error) {}
    })
  }

  const stopLogStream = () => {
    if (typeof removeLogListener === 'function') {
      removeLogListener()
      removeLogListener = null
    }
  }

  return {
    logs,
    addLog,
    startLogStream,
    stopLogStream,
  }
}
