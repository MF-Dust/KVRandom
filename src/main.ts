import { createApp } from 'vue'
import './styles/tokens.css'
import './styles/ui.css'
import App from './App.vue'
import router from './router'
import { logApi } from './api/logApi'
import { notifyRendererReady } from './api/desktopCore'

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

// Browser-only preview opens settings; desktop windows keep their assigned route.
if (!window.__KV_DESKTOP__ && window.location.hash === '') {
  router.push('/config')
}

const app = createApp(App).use(router)
await router.isReady()
app.mount('#app')
notifyRendererReady()
