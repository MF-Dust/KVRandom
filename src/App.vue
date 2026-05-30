<template>
  <router-view />
</template>

<script setup lang="ts">
  import { useRoute } from 'vue-router'
  import { watch, onMounted, onBeforeUnmount } from 'vue'
  import { appApi } from './tauriApi'

  const route = useRoute()
  watch(
    () => route.path,
    (newPath) => {
      if (newPath === '/config') {
        document.body.classList.add('is-config-page')
        document.documentElement.classList.add('is-config-page')
      } else {
        document.body.classList.remove('is-config-page')
        document.documentElement.classList.remove('is-config-page')
      }
    },
    { immediate: true }
  )

  const applyFontFamily = (fontFamily?: string) => {
    if (fontFamily && fontFamily.trim() !== '') {
      document.documentElement.style.setProperty('--ba-font-family', fontFamily)
    } else {
      document.documentElement.style.removeProperty('--ba-font-family')
    }
  }

  let removeConfigListener: (() => void) | null = null

  onMounted(async () => {
    try {
      const config = await appApi.getConfig()
      applyFontFamily(config.fontFamily)
    } catch (err) {
      console.error('加载字体配置失败:', err)
    }

    try {
      removeConfigListener = appApi.onConfigUpdated((config) => {
        applyFontFamily(config.fontFamily)
      })
    } catch (err) {
      console.error('注册配置监听器失败:', err)
    }
  })

  onBeforeUnmount(() => {
    if (typeof removeConfigListener === 'function') {
      removeConfigListener()
    }
  })
</script>

<style>
  * {
    box-sizing: border-box;
  }

  html,
  body,
  #app {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    font-family: var(
      --ba-font-family,
      '方正兰亭圆_GBK',
      'FZLanTingYuan-R-GBK',
      'Microsoft YaHei UI',
      'PingFang SC',
      sans-serif
    );
  }

  html:not(.is-config-page),
  body:not(.is-config-page),
  html:not(.is-config-page) > body > #app {
    background: transparent;
    overflow: hidden;
    user-select: none;
  }

  html.is-config-page,
  body.is-config-page,
  html.is-config-page > body > #app {
    background: #f4f5f7;
    overflow: auto;
    user-select: text;
  }
</style>
