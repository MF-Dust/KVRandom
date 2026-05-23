import { invoke } from './tauriCore'

export const audioApi = {
  playClickSound: () => invoke<void>('play_click_sound'),
  playBgm: () => invoke<void>('play_bgm'),
  stopBgm: () => invoke<void>('stop_bgm'),
  playGachaSound: (volume: number) => invoke<void>('play_gacha_sound', { volume }),
  stopGachaSound: () => invoke<void>('stop_gacha_sound'),
}

export type AudioApi = typeof audioApi
