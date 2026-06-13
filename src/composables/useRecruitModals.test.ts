import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { ref, type Ref } from 'vue'
import { useRecruitModals } from './useRecruitModals'
import type { Student } from '@/types'

// Mock audioApi
vi.mock('../api/audioApi', () => ({
  audioApi: {
    playClickSoundSafely: vi.fn(),
  },
}))

describe('useRecruitModals', () => {
  let students: Ref<Student[]>

  beforeEach(() => {
    students = ref([
      { name: '阿罗娜', weight: 1 },
      { name: '白子', weight: 2 },
    ])
    vi.clearAllMocks()
    // Mock window.alert
    vi.stubGlobal('alert', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('initializes with closed modals', () => {
    const { showDetailsModal, showSelectionModal, selectedStudent } = useRecruitModals(students)

    expect(showDetailsModal.value).toBe(false)
    expect(showSelectionModal.value).toBe(false)
    expect(selectedStudent.value).toBeNull()
  })

  it('opens rates modal', () => {
    const { showDetailsModal, showRatesModal } = useRecruitModals(students)

    showRatesModal()

    expect(showDetailsModal.value).toBe(true)
  })

  it('closes details modal', () => {
    const { showDetailsModal, showRatesModal, closeDetailsModal } = useRecruitModals(students)

    showRatesModal()
    expect(showDetailsModal.value).toBe(true)

    closeDetailsModal()
    expect(showDetailsModal.value).toBe(false)
  })

  it('opens selection modal when conditions are met', () => {
    const currencies = ref({ selectionTicket: 1 })
    const { showSelectionModal, openSelectionModal } = useRecruitModals(students)

    openSelectionModal(currencies)

    expect(showSelectionModal.value).toBe(true)
  })

  it('prevents opening selection modal without tickets', () => {
    const currencies = ref({ selectionTicket: 0 })
    const { showSelectionModal, openSelectionModal } = useRecruitModals(students)

    openSelectionModal(currencies)

    expect(showSelectionModal.value).toBe(false)
    expect(window.alert).toHaveBeenCalled()
  })

  it('prevents opening selection modal with empty student list', () => {
    students.value = []
    const currencies = ref({ selectionTicket: 1 })
    const { showSelectionModal, openSelectionModal } = useRecruitModals(students)

    openSelectionModal(currencies)

    expect(showSelectionModal.value).toBe(false)
    expect(window.alert).toHaveBeenCalled()
  })

  it('selects a student', () => {
    const { selectedStudent, selectStudent } = useRecruitModals(students)

    const student = students.value[0]
    selectStudent(student)

    expect(selectedStudent.value).toBe(student)
  })

  it('closes selection modal and clears selected student', () => {
    const currencies = ref({ selectionTicket: 1 })
    const {
      showSelectionModal,
      selectedStudent,
      openSelectionModal,
      selectStudent,
      closeSelectionModal,
    } = useRecruitModals(students)

    openSelectionModal(currencies)
    selectStudent(students.value[0])

    expect(showSelectionModal.value).toBe(true)
    expect(selectedStudent.value).not.toBeNull()

    closeSelectionModal()

    expect(showSelectionModal.value).toBe(false)
    expect(selectedStudent.value).toBeNull()
  })

  it('uses custom error handler when provided', () => {
    const customErrorHandler = vi.fn()
    const currencies = ref({ selectionTicket: 0 })
    const { openSelectionModal } = useRecruitModals(students)

    openSelectionModal(currencies, customErrorHandler)

    expect(customErrorHandler).toHaveBeenCalled()
  })
})
