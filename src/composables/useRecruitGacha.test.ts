import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
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
    vi.stubGlobal('alert', vi.fn())
    vi.spyOn(console, 'error').mockImplementation(() => {})
    playVideoAndExecute.mockReset().mockImplementation((callback) => {
      void callback()
    })
    currencies.value = {
      pyroxene: 12000,
      credit: 50000000,
      ap: 120,
      selectionTicket: 1,
      recruitTicket1: 5,
      recruitTicket10: 1,
    }
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  const createSelection = (autoSkipVideo = true) => {
    const selectedStudent = ref<Student | null>({ name: '阿罗娜', weight: 1 })
    const closeSelectionModal = vi.fn(() => {
      selectedStudent.value = null
    })
    const { confirmStudentSelection } = useRecruitGacha(
      students,
      currencies,
      saveCurrencies,
      playVideoAndExecute,
      ref(autoSkipVideo),
      ref<RecruitPool | null>({ id: 'pool_select', gachaType: 'select' } as RecruitPool)
    )
    return {
      selectedStudent,
      closeSelectionModal,
      confirm: () => confirmStudentSelection(selectedStudent, closeSelectionModal),
    }
  }

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

  it('uses the active selection pool and saves the ticket payment only after success', async () => {
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

    expect(recruitApi.confirmSelectStudent).toHaveBeenCalledWith('阿罗娜', 'recruit', 'pool_select')
    expect(pickCountApi.confirm).not.toHaveBeenCalled()
    expect(currencies.value.selectionTicket).toBe(0)
    expect(saveCurrencies).toHaveBeenCalledTimes(1)
    expect(closeSelectionModal).toHaveBeenCalledTimes(1)
  })

  it('does not allow a single selection ticket to be used twice', async () => {
    const selection = createSelection()
    await selection.confirm()
    selection.selectedStudent.value = { name: '白子', weight: 1 }
    await selection.confirm()

    expect(recruitApi.confirmSelectStudent).toHaveBeenCalledTimes(1)
    expect(currencies.value.selectionTicket).toBe(0)
    expect(saveCurrencies).toHaveBeenCalledTimes(1)
    expect(selection.closeSelectionModal).toHaveBeenCalledTimes(1)
    expect(alert).toHaveBeenCalledTimes(1)
  })

  it('rejects selection without a ticket before closing or playing the video', async () => {
    currencies.value.selectionTicket = 0
    const selection = createSelection(false)
    await selection.confirm()

    expect(alert).toHaveBeenCalledTimes(1)
    expect(selection.closeSelectionModal).not.toHaveBeenCalled()
    expect(playVideoAndExecute).not.toHaveBeenCalled()
    expect(recruitApi.confirmSelectStudent).not.toHaveBeenCalled()
    expect(saveCurrencies).not.toHaveBeenCalled()
    expect(currencies.value.selectionTicket).toBe(0)
  })

  it('keeps the ticket on backend failure and allows a retry', async () => {
    vi.mocked(recruitApi.confirmSelectStudent).mockRejectedValueOnce(new Error('backend failed'))
    const selection = createSelection()
    await selection.confirm()

    expect(currencies.value.selectionTicket).toBe(1)
    expect(saveCurrencies).not.toHaveBeenCalled()

    selection.selectedStudent.value = { name: '阿罗娜', weight: 1 }
    await selection.confirm()
    expect(recruitApi.confirmSelectStudent).toHaveBeenCalledTimes(2)
    expect(currencies.value.selectionTicket).toBe(0)
    expect(saveCurrencies).toHaveBeenCalledTimes(1)
  })

  it.each([true, false])(
    'blocks duplicate in-flight selection (autoSkipVideo=%s)',
    async (autoSkipVideo) => {
      let complete!: () => void
      vi.mocked(recruitApi.confirmSelectStudent).mockReturnValueOnce(
        new Promise<void>((resolve) => {
          complete = resolve
        })
      )
      let videoAction!: () => Promise<void>
      playVideoAndExecute.mockImplementationOnce((action) => {
        videoAction = action
      })
      const selection = createSelection(autoSkipVideo)
      let pending = selection.confirm()
      if (!autoSkipVideo) {
        await pending
        pending = videoAction()
        await videoAction()
      }
      selection.selectedStudent.value = { name: '白子', weight: 1 }
      await selection.confirm()

      expect(recruitApi.confirmSelectStudent).toHaveBeenCalledTimes(1)
      expect(selection.closeSelectionModal).toHaveBeenCalledTimes(1)
      expect(currencies.value.selectionTicket).toBe(1)
      expect(saveCurrencies).not.toHaveBeenCalled()

      complete()
      await pending
      expect(currencies.value.selectionTicket).toBe(0)
      expect(saveCurrencies).toHaveBeenCalledTimes(1)
    }
  )

  it('rechecks the ticket when the delayed video action actually submits', async () => {
    let videoAction!: () => Promise<void>
    playVideoAndExecute.mockImplementationOnce((action) => {
      videoAction = action
    })
    const selection = createSelection(false)
    await selection.confirm()
    expect(recruitApi.confirmSelectStudent).not.toHaveBeenCalled()
    expect(currencies.value.selectionTicket).toBe(1)
    expect(saveCurrencies).not.toHaveBeenCalled()

    currencies.value.selectionTicket = 0
    await videoAction()
    expect(recruitApi.confirmSelectStudent).not.toHaveBeenCalled()
    expect(saveCurrencies).not.toHaveBeenCalled()
  })
})
