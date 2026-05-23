import { describe, it, expect } from 'vitest'
import { studentListToText } from './studentListText'
import type { Student } from '@/types'

describe('studentListToText', () => {
  it('returns empty string for empty list', () => {
    expect(studentListToText([])).toBe('')
  })

  it('returns empty string when called with no argument', () => {
    expect(studentListToText()).toBe('')
  })

  it('joins names with LF newline in order', () => {
    const students: Student[] = [
      { name: '阿罗娜', weight: 1 },
      { name: '普拉娜', weight: 2 },
      { name: '日富美', weight: 3 },
    ]
    expect(studentListToText(students)).toBe('阿罗娜\n普拉娜\n日富美')
  })

  it('preserves duplicate names', () => {
    const students: Student[] = [
      { name: '白子', weight: 1 },
      { name: '白子', weight: 5 },
    ]
    expect(studentListToText(students)).toBe('白子\n白子')
  })
})
