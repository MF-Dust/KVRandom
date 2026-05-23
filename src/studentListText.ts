export function studentListToText(studentList: any[] = []) {
  return studentList.map((student) => student.name).join('\n')
}
