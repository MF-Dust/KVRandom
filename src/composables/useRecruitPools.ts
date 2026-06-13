import { ref, computed, onMounted, onBeforeUnmount, shallowRef, watchEffect } from 'vue'
import { audioApi } from '../api/audioApi'
import { appApi } from '../api/appApi'
import type { RecruitConfig, RecruitPool, Student } from '@/types'
import { createDefaultConfig } from '../configDefaults'

export function useRecruitPools() {
  const pools = ref<RecruitPool[]>([])
  const activePoolIndex = ref(0)
  const students = ref<Student[]>([])
  const recruitConfig = ref<RecruitConfig>(createDefaultConfig().recruitConfig)

  const currentPool = computed(() => pools.value[activePoolIndex.value] || null)

  // Cached sorted students with debounce
  const sortedStudents = shallowRef<Student[]>([])
  let sortDebounceTimer: ReturnType<typeof setTimeout> | null = null

  const getBoostedWeight = (studentName: string, baseWeight: number) => {
    const pool = currentPool.value
    if (!pool || !pool.rateBoostStudents || pool.rateBoostStudents.length === 0) {
      return baseWeight
    }

    const boost = pool.rateBoostStudents.find((b) => b.studentName === studentName)
    const multiplier = boost && boost.boostMultiplier > 0 ? boost.boostMultiplier : 1

    if (multiplier === 1) {
      return baseWeight
    }

    return baseWeight * multiplier
  }

  const totalBoostedWeight = computed(() => {
    return students.value.reduce((sum, s) => {
      const boostedWeight = getBoostedWeight(s.name, s.weight || 0)
      return sum + boostedWeight
    }, 0)
  })

  watchEffect(() => {
    // Clear existing timer
    if (sortDebounceTimer) {
      clearTimeout(sortDebounceTimer)
    }

    // Debounce the sort operation
    sortDebounceTimer = setTimeout(() => {
      const sorted = [...students.value].sort((a, b) => {
        const aWeight = getBoostedWeight(a.name, a.weight)
        const bWeight = getBoostedWeight(b.name, b.weight)
        return bWeight - aWeight
      })
      sortedStudents.value = sorted
    }, 100)
  })

  const getBoostMultiplier = (studentName: string) => {
    const pool = currentPool.value
    if (!pool || !pool.rateBoostStudents || pool.rateBoostStudents.length === 0) {
      return 1
    }

    const boost = pool.rateBoostStudents.find((b) => b.studentName === studentName)
    return boost && boost.boostMultiplier > 0 ? boost.boostMultiplier : 1
  }

  const calculateProb = (studentName: string, baseWeight: number) => {
    if (totalBoostedWeight.value <= 0) return '0.00'
    const boostedWeight = getBoostedWeight(studentName, baseWeight)
    return ((boostedWeight / totalBoostedWeight.value) * 100).toFixed(2)
  }

  const switchPool = (idx: number) => {
    activePoolIndex.value = idx
    audioApi.playClickSoundSafely()
  }

  const loadConfig = async () => {
    try {
      const cfg = await appApi.getConfig()
      pools.value = cfg.recruitPools || []
      students.value = cfg.studentList || []
      recruitConfig.value = cfg.recruitConfig
    } catch (err) {
      console.error('Failed to load recruit config:', err)
    }
  }

  let removeConfigListener: (() => void) | null = null

  onMounted(async () => {
    await loadConfig()

    removeConfigListener = appApi.onConfigUpdated((cfg) => {
      pools.value = cfg.recruitPools || []
      students.value = cfg.studentList || []
      recruitConfig.value = cfg.recruitConfig
    })
  })

  onBeforeUnmount(() => {
    if (typeof removeConfigListener === 'function') {
      removeConfigListener()
      removeConfigListener = null
    }
  })

  return {
    pools,
    activePoolIndex,
    students,
    recruitConfig,
    currentPool,
    sortedStudents,
    totalBoostedWeight,
    getBoostedWeight,
    getBoostMultiplier,
    calculateProb,
    switchPool,
  }
}
