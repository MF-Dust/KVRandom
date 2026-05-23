import type { Student } from '@/types'

export function studentListToText(studentList: Student[] = []): string {
  return studentList.map((student) => student.name).join('\n')
}
