/**
 * Domain types — atomic business entities mirrored from the Rust backend.
 * Field names match serde camelCase output.
 */

export type Rarity = 'red' | 'pink' | 'blue' | string

export interface Student {
  name: string
  weight: number
  avatar?: string | null
  academy?: string | null
  club?: string | null
}

export interface PickedStudent {
  name: string
  rarity: Rarity
  avatar?: string | null
  academy?: string | null
  club?: string | null
}

export interface LogEntry {
  level: string
  text: string
  time: string | number
}

export interface ApiResult {
  ok: boolean
  message: string
  detail?: string | null
  restartRequired?: boolean | null
}

export type LogLevel = 'log' | 'info' | 'success' | 'warn' | 'warning' | 'error' | 'debug'
