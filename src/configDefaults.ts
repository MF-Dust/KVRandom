import type { AppConfig } from '@/types'
import defaults from './configDefaults.json'

export const DEFAULT_ADMIN_TASK_NAME = 'KVRandom (Admin)'

export const MIN_PICK_COUNT = 1
export const MAX_PICK_COUNT = 10

export const DEFAULT_FLOATING_SIZE_PERCENT = 100
export const DEFAULT_FLOATING_TRANSPARENCY_PERCENT = 20
export const DEFAULT_BACKGROUND_DARKNESS_PERCENT = 50
export const DEFAULT_PICK_COUNT = 1
export const DEFAULT_PLAY_MUSIC = false
export const DEFAULT_PLAY_GACHA_SOUND = true
export const DEFAULT_GACHA_SOUND_VOLUME = 0.6
export const DEFAULT_BGM_VOLUME = 0.3
export const DEFAULT_PICK_EXIT_ANIMATION_MS = 400
export const DEFAULT_RESULT_FLY_INTERVAL_MS = 80
export const DEFAULT_RESULT_REVEAL_DELAY_MS = 420
export const DEFAULT_RESULT_CLOSE_FADE_MS = 220

export const createDefaultConfig = (): AppConfig => structuredClone(defaults)
