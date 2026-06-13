import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref } from 'vue'
import { useRecruitGacha } from './useRecruitGacha'
import type { Student } from '@/types'

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
  })

  it('uses the selected-student command for selection recruitment', async () => {
    const autoSkipVideo = ref(true)
    const selectedStudent = ref<Student | null>({ name: '白子', weight: 2 })
    const closeSelectionModal = vi.fn(() => {
      selectedStudent.value = null
    })

    const { confirmStudentSelection } = useRecruitGacha(
      students,
      currencies,
      saveCurrencies,
      playVideoAndExecute,
      autoSkipVideo
    )

    await confirmStudentSelection(selectedStudent, closeSelectionModal)

    expect(recruitApi.confirmSelectStudent).toHaveBeenCalledWith('白子', 'recruit')
    expect(pickCountApi.confirm).not.toHaveBeenCalled()
    expect(closeSelectionModal).toHaveBeenCalled()
  })
})
