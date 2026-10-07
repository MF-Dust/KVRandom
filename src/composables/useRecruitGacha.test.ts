import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref } from 'vue'
import { useRecruitGacha } from './useRecruitGacha'
import type { RecruitPool, Student } from '@/types'

vi.mock('../api/audioApi', () => ({
  audioApi: {
    playClickSoundSafely: vi.fn(),
  },
}))

vi.mock('../api/pickCountApi', () => ({
  pickCountApi: {
    confirm: vi.fn().mockResolvedValue(undefined),
  },
}))

vi.mock('../api/recruitApi', () => ({
  recruitApi: {
    confirmSelectStudent: vi.fn().mockResolvedValue(undefined),
  },
}))

import { pickCountApi } from '../api/pickCountApi'
import { recruitApi } from '../api/recruitApi'

describe('useRecruitGacha', () => {
  const students = ref<Student[]>([{ name: '阿罗娜', weight: 1 }])
  const currencies = ref({
    pyroxene: 12000,
    credit: 50000000,
    ap: 120,
    selectionTicket: 1,
    recruitTicket1: 5,
    recruitTicket10: 1,
  })
  const saveCurrencies = vi.fn()
  const playVideoAndExecute = vi.fn((callback: () => Promise<void>) => {
    void callback()
  })

  beforeEach(() => {
    vi.clearAllMocks()
    currencies.value = {
      pyroxene: 12000,
      credit: 50000000,
      ap: 120,
      selectionTicket: 1,
      recruitTicket1: 5,
      recruitTicket10: 1,
    }
  })

  it('passes the active pool and commits payment after a successful draw', async () => {
    const autoSkipVideo = ref(true)
    const currentPool = ref<RecruitPool | null>({
      id: 'pool_a',
      gachaType: 'gacha',
    } as RecruitPool)

    const { handleGacha } = useRecruitGacha(
      students,
      currencies,
      saveCurrencies,
      playVideoAndExecute,
      autoSkipVideo,
      currentPool
    )

    await handleGacha(10)

    expect(pickCountApi.confirm).toHaveBeenCalledWith(10, false, 'recruit', 'pool_a')
    expect(currencies.value.recruitTicket10).toBe(0)
    expect(saveCurrencies).toHaveBeenCalledTimes(1)
  })

  it('does not consume currency when the backend draw fails', async () => {
    vi.mocked(pickCountApi.confirm).mockRejectedValueOnce(new Error('backend failed'))
    const autoSkipVideo = ref(true)
    const currentPool = ref<RecruitPool | null>({
      id: 'pool_a',
      gachaType: 'gacha',
    } as RecruitPool)

    const { handleGacha } = useRecruitGacha(
      students,
      currencies,
      saveCurrencies,
      playVideoAndExecute,
      autoSkipVideo,
      currentPool
    )

    await handleGacha(10)

    expect(currencies.value.recruitTicket10).toBe(1)
    expect(currencies.value.pyroxene).toBe(12000)
    expect(saveCurrencies).not.toHaveBeenCalled()
  })

  it('uses the selected-student command with the active selection pool', async () => {
    const autoSkipVideo = ref(true)
    const currentPool = ref<RecruitPool | null>({
      id: 'pool_select',
      gachaType: 'select',
    } as RecruitPool)
    const selectedStudent = ref<Student | null>({ name: '阿罗娜', weight: 1 })
    const closeSelectionModal = vi.fn(() => {
      selectedStudent.value = null
    })

    const { confirmStudentSelection } = useRecruitGacha(
      students,
      currencies,
      saveCurrencies,
      playVideoAndExecute,
      autoSkipVideo,
      currentPool
    )

    await confirmStudentSelection(selectedStudent, closeSelectionModal)

    expect(recruitApi.confirmSelectStudent).toHaveBeenCalledWith(
      '阿罗娜',
      'recruit',
      'pool_select'
    )
    expect(pickCountApi.confirm).not.toHaveBeenCalled()
    expect(saveCurrencies).not.toHaveBeenCalled()
    expect(closeSelectionModal).toHaveBeenCalled()
  })
})
