import { inject, provide, type Ref } from 'vue'
import type { AppConfig } from '@/types'

const configModelKey = Symbol('config-model')

export function provideConfigModel(config: Ref<AppConfig>): void {
  provide(configModelKey, config)
}

export function useConfigModel(): Ref<AppConfig> {
  const config = inject<Ref<AppConfig>>(configModelKey)
  if (!config) {
    throw new Error('Config model is not provided')
  }
  return config
}
