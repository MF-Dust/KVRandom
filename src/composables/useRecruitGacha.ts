import { ref, type Ref } from 'vue'
import { audioApi } from '../api/audioApi'
import { pickCountApi } from '../api/pickCountApi'
import { recruitApi } from '../api/recruitApi'
import type { RecruitPool, Student } from '@/types'

interface Currencies {
  pyroxene: number
  credit: number
  ap: number
  selectionTicket: number
  recruitTicket1: number
  recruitTicket10: number
}

type RecruitPayment =
  | { currency: 'recruitTicket1'; amount: 1 }
  | { currency: 'recruitTicket10'; amount: 1 }
  | { currency: 'pyroxene'; amount: number }

export function useRecruitGacha(
  students: Ref<Student[]>,
  currencies: Ref<Currencies>,
  saveCurrencies: () => void,
  playVideoAndExecute: (callback: () => Promise<void>) => void,
  autoSkipVideo: Ref<boolean | undefined>,
  currentPool: Ref<RecruitPool | null>
) {
  const showResultOverlay = ref(false)

  const resolvePayment = (count: number): RecruitPayment | null => {
    if (count === 1) {
      if (currencies.value.recruitTicket1 > 0) {
        return { currency: 'recruitTicket1', amount: 1 }
      }
      return currencies.value.pyroxene >= 120 ? { currency: 'pyroxene', amount: 120 } : null
    }

    if (count === 10) {
      if (currencies.value.recruitTicket10 > 0) {
        return { currency: 'recruitTicket10', amount: 1 }
      }
      return currencies.value.pyroxene >= 1200 ? { currency: 'pyroxene', amount: 1200 } : null
    }

    return null
  }

  const commitPayment = (payment: RecruitPayment) => {
    currencies.value[payment.currency] -= payment.amount
    saveCurrencies()
  }

  const handleGacha = async (count: number) => {
    audioApi.playClickSoundSafely()

    if (students.value.length === 0) {
      alert('老师，名单中还没有任何成员哦！先去设置面板「导入名单」吧～')
      return
    }

    if (count !== 1 && count !== 10) {
      console.error('Unsupported recruit count:', count)
      return
    }

    const poolId = currentPool.value?.id || null
    if (!poolId || currentPool.value?.gachaType !== 'gacha') {
      console.error('Invalid recruit pool:', currentPool.value)
      return
    }

    const payment = resolvePayment(count)
    if (!payment) {
      alert('老师，招募券与青辉石都不够了哦！点击上方加号补充一下吧～')
      return
    }

    const executeRecruit = async () => {
      try {
        await pickCountApi.confirm(count, false, 'recruit', poolId)
        commitPayment(payment)
      } catch (err) {
        console.error('Failed to trigger recruit draw:', err)
      }
    }

    if (autoSkipVideo.value) {
      await executeRecruit()
    } else {
      playVideoAndExecute(executeRecruit)
    }
  }

  const confirmStudentSelection = async (
    selectedStudent: Ref<Student | null>,
    closeSelectionModal: () => void
  ) => {
    if (!selectedStudent.value) return

    audioApi.playClickSoundSafely()

    const poolId = currentPool.value?.id || null
    if (!poolId || currentPool.value?.gachaType !== 'select') {
      console.error('Invalid selection pool:', currentPool.value)
      return
    }

    const studentName = selectedStudent.value.name
    closeSelectionModal()

    const executeSelection = async () => {
      try {
        await recruitApi.confirmSelectStudent(studentName, 'recruit', poolId)
      } catch (err) {
        console.error('Failed to trigger selection:', err)
      }
    }

    if (autoSkipVideo.value) {
      await executeSelection()
    } else {
      playVideoAndExecute(executeSelection)
    }
  }

  return {
    showResultOverlay,
    handleGacha,
    confirmStudentSelection,
  }
}
