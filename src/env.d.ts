/// <reference types="vite/client" />

export {}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const component: DefineComponent<Record<string, never>, Record<string, never>, any>
  export default component
}

declare global {
  interface Window {
    __TAURI_INTERNALS__?: Record<string, unknown>
  }
}
