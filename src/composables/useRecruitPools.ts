import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { audioApi } from '../api/audioApi'
import { appApi } from '../api/appApi'
import type { RecruitConfig, RecruitPool, Student } from '@/types'
import { createDefaultConfig } from '../configDefaults'

const WEIGHT_BOOST_GAMMA = 1.5

export function useRecruitPools() {
  const pools = ref<RecruitPool[]>([])
  const activePoolIndex = ref(0)
  const students = ref<Student[]>([])
  const recruitConfig = ref<RecruitConfig>(createDefaultConfig().recruitConfig)

  const currentPool = computed(() => pools.value[activePoolIndex.value] || null)

  const boostMultiplierMap = computed(() => {
    const boosts = currentPool.value?.rateBoostStudents || []
    return new Map(
      boosts
        .filter((boost) => boost.studentName && boost.boostMultiplier > 0)
        .map((boost) => [boost.studentName, boost.boostMultiplier])
    )
  })

  const getBoostMultiplier = (studentName: string) => {
    return boostMultiplierMap.value.get(studentName) || 1
  }

  const getBoostedWeight = (studentName: string, baseWeight: number) => {
    return Math.max(0, baseWeight) * getBoostMultiplier(studentName)
  }

  const getEffectiveWeight = (studentName: string, baseWeight: number) => {
    return Math.pow(getBoostedWeight(studentName, baseWeight), WEIGHT_BOOST_GAMMA)
  }

  const totalBoostedWeight = computed(() => {
    return students.value.reduce((sum, student) => {
      return sum + getEffectiveWeight(student.name, student.weight || 0)
    }, 0)
  })

  const sortedStudents = computed(() => {
    return [...students.value].sort((a, b) => {
      return getEffectiveWeight(b.name, b.weight) - getEffectiveWeight(a.name, a.weight)
    })
  })

  const calculateProb = (studentName: string, baseWeight: number) => {
    if (totalBoostedWeight.value <= 0) return '0.00'
    const effectiveWeight = getEffectiveWeight(studentName, baseWeight)
    return ((effectiveWeight / totalBoostedWeight.value) * 100).toFixed(2)
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
