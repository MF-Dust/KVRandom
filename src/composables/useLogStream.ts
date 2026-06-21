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
  const seenLogIds = new Set<string>()

  const addLogEntry = (entry: LogEntryEventPayload) => {
    if (entry.id && seenLogIds.has(entry.id)) {
      return
    }
    if (entry.id) {
      seenLogIds.add(entry.id)
    }
    const time = entry.time
      ? new Date(entry.time).toLocaleTimeString('zh-CN', { hour12: false })
      : undefined
    addLog(entry.level || 'info', entry.text || '', time, entry.id)
  }

  const addLog = (
    level: LogLevel | string,
    text: string,
    timeOverride?: string,
    idOverride?: string
  ) => {
    const time = timeOverride || new Date().toLocaleTimeString('zh-CN', { hour12: false })
    const id = idOverride || `${Date.now()}-${logSeed++}`
    logs.value.push({ id, level, text, time })
    if (logs.value.length > 200) {
      const removed = logs.value.splice(0, logs.value.length - 200)
      removed.forEach((entry) => seenLogIds.delete(entry.id))
    }
  }

  const startLogStream = async () => {
    if (typeof removeLogListener === 'function') {
      removeLogListener()
    }

    try {
      const existingLogs = await appApi.getLogs()
      existingLogs.forEach(addLogEntry)
    } catch (_error) {}

    removeLogListener = appApi.onLogEntry((entry) => {
      try {
        addLogEntry(entry)
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
