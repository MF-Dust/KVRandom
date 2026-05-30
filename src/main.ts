import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { logApi } from './api/logApi'

import './style.css'

const logToMain = (level: string, text: string) => {
  logApi.send(level, text)
}

;(['warn', 'error'] as const).forEach((method) => {
  const original = console[method].bind(console)
  console[method] = (...args: unknown[]) => {
    const text = args
      .map((arg) => {
        if (typeof arg === 'string') return arg
        try {
          return JSON.stringify(arg)
        } catch (_error) {
          return String(arg)
        }
      })
      .join(' ')
      .slice(0, 800)
    logToMain(method, text)
    original(...args)
  }
})

// If accessed outside the Tauri shell during frontend preview, redirect straight to config.
const isTauri = window.__TAURI_INTERNALS__ !== undefined
if (!isTauri && window.location.hash === '') {
  router.push('/config')
}

createApp(App).use(router).mount('#app')
