import { ref, type Ref } from 'vue'
import { audioApi } from '../api/audioApi'
import { pickCountApi } from '../api/pickCountApi'
import { recruitApi } from '../api/recruitApi'
import type { Student } from '@/types'

interface Currencies {
  pyroxene: number
  credit: number
  ap: number
  selectionTicket: number
  recruitTicket1: number
  recruitTicket10: number
}

export function useRecruitGacha(
  students: Ref<Student[]>,
  currencies: Ref<Currencies>,
  saveCurrencies: () => void,
  playVideoAndExecute: (callback: () => Promise<void>) => void,
  autoSkipVideo: Ref<boolean | undefined>
) {
  const showResultOverlay = ref(false)

  const handleGacha = async (count: number) => {
    audioApi.playClickSoundSafely()

    if (students.value.length === 0) {
      alert('老师，名单中还没有任何成员哦！先去设置面板「导入名单」吧～')
      return
    }

    if (count === 1) {
      if (currencies.value.recruitTicket1 > 0) {
        currencies.value.recruitTicket1 -= 1
      } else {
        const cost = 120
        if (currencies.value.pyroxene < cost) {
          alert('老师，招募券与青辉石都不够了哦！点击上方加号补充一下吧～')
          return
        }
        currencies.value.pyroxene -= cost
      }
    } else {
      if (currencies.value.recruitTicket10 > 0) {
        currencies.value.recruitTicket10 -= 1
      } else {
        const cost = 1200
        if (currencies.value.pyroxene < cost) {
          alert('老师，招募券与青辉石都不够了哦！点击上方加号补充一下吧～')
          return
        }
        currencies.value.pyroxene -= cost
      }
    }

    saveCurrencies()

    const executeRecruit = async () => {
      try {
        // Confirm pick count, hide recruit window, track draw source as 'recruit'
        await pickCountApi.confirm(count, false, 'recruit')
      } catch (err) {
        console.error('Failed to trigger recruit draw:', err)
      }
    }

    // Auto skip video if enabled
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

    // Selection tickets are an entry condition only; select recruitment is intentionally no-consume.
    saveCurrencies()

    const studentName = selectedStudent.value.name
    closeSelectionModal()

    const executeSelection = async () => {
      try {
        await recruitApi.confirmSelectStudent(studentName, 'recruit')
      } catch (err) {
        console.error('Failed to trigger selection:', err)
      }
    }

    // Auto skip video if enabled
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
