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
    __KV_DESKTOP__?: boolean
    chrome?: {
      webview?: {
        postMessage: (message: unknown) => void
        addEventListener: (event: 'message', callback: (event: { data: any }) => void) => void // eslint-disable-line @typescript-eslint/no-explicit-any
      }
    }
  }
}
