import type { AppConfig } from '@/types'
import defaults from './configDefaults.json'

export const DEFAULT_ADMIN_TASK_NAME = 'KVRandom (Admin)'

export const MIN_PICK_COUNT = 1
export const MAX_PICK_COUNT = 10

export const DEFAULT_BACKGROUND_DARKNESS_PERCENT = 50
export const DEFAULT_PICK_COUNT = 1

export const createDefaultConfig = (): AppConfig => structuredClone(defaults)
