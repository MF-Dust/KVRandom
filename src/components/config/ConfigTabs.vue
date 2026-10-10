<template>
  <nav class="ba-sidebar-nav" aria-label="设置分类">
    <section v-for="group in tabGroups" :key="group.title" class="ba-nav-group">
      <h3 class="ba-nav-group-title">{{ group.title }}</h3>
      <button
        v-for="tab in group.tabs"
        :key="tab.key"
        type="button"
        class="ba-nav-item"
        :class="{ active: activeTab === tab.key }"
        :aria-current="activeTab === tab.key ? 'page' : undefined"
        :title="tab.label"
        @click="$emit('switch-tab', tab.key)"
      >
        <!-- Icons are static SVG strings defined in useConfigTabs -->
        <span class="ba-nav-icon" aria-hidden="true" v-html="tab.icon"></span>
        <span class="ba-nav-label">{{ tab.label }}</span>
      </button>
    </section>
  </nav>
</template>

<script setup lang="ts">
  import type { PropType } from 'vue'

  type ConfigTab = {
    key: string
    label: string
    icon: string
  }

  type ConfigTabGroup = {
    title: string
    tabs: ConfigTab[]
  }

  defineProps({
    activeTab: {
      type: String,
      required: true,
    },
    tabGroups: {
      type: Array as PropType<ConfigTabGroup[]>,
      required: true,
    },
  })

  defineEmits(['switch-tab'])
</script>

<style scoped>
  .ba-sidebar-nav {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 4px 4px 10px;
    overflow-x: hidden;
    overflow-y: auto;
    scrollbar-width: none;
  }

  .ba-sidebar-nav::-webkit-scrollbar {
    display: none;
  }

  .ba-nav-group {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .ba-nav-group-title {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0 0 2px;
    padding: 2px 8px;
    color: var(--ba-subtle);
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.08em;
    user-select: none;
  }

  .ba-nav-group-title::before {
    content: '';
    flex: none;
    width: 4px;
    height: 12px;
    border-radius: 1px;
    background: var(--ba-blue);
    transform: skewX(var(--ba-skew));
  }

  .ba-nav-group-title::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--ba-line-soft);
  }

  .ba-nav-item {
    position: relative;
    isolation: isolate;
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 42px;
    padding: 0 18px;
    border: 0;
    background: transparent;
    color: var(--ba-ink);
    font-family: inherit;
    font-size: 14px;
    font-weight: 700;
    text-align: left;
    white-space: nowrap;
    cursor: pointer;
    transition: color 0.18s ease;
  }

  /* Parallelogram highlight behind the upright label */
  .ba-nav-item::before {
    content: '';
    position: absolute;
    inset: 2px 6px;
    z-index: -1;
    border-radius: var(--ba-radius-sm);
    background: transparent;
    transform: skewX(var(--ba-skew));
    transition:
      background 0.18s ease,
      box-shadow 0.18s ease;
  }

  /* Yellow selection tick */
  .ba-nav-item::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 6px;
    width: 5px;
    height: 24px;
    border-radius: 1px;
    background: var(--ba-yellow);
    box-shadow: 0 0 6px color-mix(in srgb, var(--ba-yellow) 60%, transparent);
    transform: translateY(-50%) skewX(var(--ba-skew)) scaleY(0);
    transition: transform 0.22s cubic-bezier(0.34, 1.4, 0.64, 1);
  }

  .ba-nav-item:hover {
    color: var(--ba-blue-strong);
  }

  .ba-nav-item:hover::before {
    background: var(--ba-blue-soft);
  }

  .ba-nav-item.active {
    color: #ffffff;
  }

  .ba-nav-item.active::before {
    background: linear-gradient(100deg, var(--ba-blue) 0%, var(--ba-blue-hover) 100%);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.35),
      0 4px 12px var(--ba-blue-glow);
  }

  .ba-nav-item.active::after {
    transform: translateY(-50%) skewX(var(--ba-skew)) scaleY(1);
  }

  .ba-nav-item:focus-visible {
    outline: none;
  }

  .ba-nav-item:focus-visible::before {
    box-shadow: 0 0 0 2px var(--ba-blue);
  }

  .ba-nav-icon {
    display: inline-flex;
    flex: none;
    width: 20px;
    height: 20px;
  }

  .ba-nav-icon :deep(svg) {
    width: 20px;
    height: 20px;
  }

  .ba-nav-label {
    overflow: hidden;
    text-overflow: ellipsis;
  }

  @media (max-width: 768px) {
    .ba-nav-group-title,
    .ba-nav-label {
      display: none;
    }

    .ba-nav-group + .ba-nav-group {
      padding-top: 8px;
      border-top: 1px solid var(--ba-line-soft);
    }

    .ba-nav-item {
      justify-content: center;
      padding: 0;
    }

    .ba-nav-item::after {
      left: 2px;
    }
  }
</style>
