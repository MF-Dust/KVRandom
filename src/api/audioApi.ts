import { invoke } from './tauriCore'

export const audioApi = {
  playClickSound: (path = 'sound/button_click.wav', volume = 1) =>
    invoke<void>('play_click_sound', { path, volume }),
  playBgm: (paths: string[] = ['sound/bgm.mp3'], volume = 0.3) =>
    invoke<void>('play_bgm', { paths, volume }),
  stopBgm: () => invoke<void>('stop_bgm'),
  playGachaSound: (volume: number, path = 'sound/gacha_loading.ogg') =>
    invoke<void>('play_gacha_sound', { volume, path }),
  stopGachaSound: () => invoke<void>('stop_gacha_sound'),
}

export type AudioApi = typeof audioApi
