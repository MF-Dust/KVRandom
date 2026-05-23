/// <reference types="vite/client" />

import type { AudioApi } from './api/audioApi'
import type { FloatingButtonApi } from './api/floatingButtonApi'
import type { LogApi } from './api/logApi'
import type { PickCountApi } from './api/pickCountApi'
import type { PickResultApi } from './api/pickResultApi'
import type { RecruitApi } from './api/recruitApi'

export {}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const component: DefineComponent<Record<string, never>, Record<string, never>, any>
  export default component
}

declare global {
  interface Window {
    floatingButtonApi: FloatingButtonApi
    pickCountApi: PickCountApi
    pickResultApi: PickResultApi
    audioApi: AudioApi
    logApi: LogApi
    recruitApi: RecruitApi
    __TAURI_INTERNALS__: Record<string, unknown>
  }
}
