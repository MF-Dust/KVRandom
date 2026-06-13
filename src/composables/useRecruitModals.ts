import { ref } from 'vue'
import { audioApi } from '../api/audioApi'
import type { Student } from '@/types'

export function useRecruitModals(students: { value: Student[] }) {
  const showDetailsModal = ref(false)
  const showSelectionModal = ref(false)
  const selectedStudent = ref<Student | null>(null)

  const showRatesModal = () => {
    audioApi.playClickSoundSafely()
    showDetailsModal.value = true
  }

  const closeDetailsModal = () => {
    showDetailsModal.value = false
  }

  const openSelectionModal = (
    currencies: { value: { selectionTicket: number } },
    onError?: (message: string) => void
  ) => {
    audioApi.playClickSoundSafely()

    if (currencies.value.selectionTicket < 1) {
      const message = '老师，您手头上没有自选券了哦，点击左侧按钮可以购买一张自选券～'
      if (onError) {
        onError(message)
      } else {
        alert(message)
      }
      return
    }

    if (students.value.length === 0) {
      const message = '老师，名单中还没有任何学生哦，自选券找不到人可以招募呀～'
      if (onError) {
        onError(message)
      } else {
        alert(message)
      }
      return
    }

    selectedStudent.value = null
    showSelectionModal.value = true
  }

  const closeSelectionModal = () => {
    showSelectionModal.value = false
    selectedStudent.value = null
  }

  const selectStudent = (student: Student) => {
    audioApi.playClickSoundSafely()
    selectedStudent.value = student
  }

  return {
    showDetailsModal,
    showSelectionModal,
    selectedStudent,
    showRatesModal,
    closeDetailsModal,
    openSelectionModal,
    closeSelectionModal,
    selectStudent,
  }
}
