import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { useRecruitPools } from './useRecruitPools'

vi.mock('../api/audioApi', () => ({
  audioApi: {
    playClickSoundSafely: vi.fn(),
  },
}))

vi.mock('../api/appApi', () => ({
  appApi: {
    getConfig: vi.fn().mockResolvedValue({
      studentList: [
        { name: '阿罗娜', weight: 1 },
        { name: '白子', weight: 2 },
      ],
      recruitConfig: {},
      recruitPools: [
        {
          id: 'pool_a',
          name: 'A',
          rateBoostStudents: [{ studentName: '阿罗娜', boostMultiplier: 4 }],
        },
      ],
    }),
    onConfigUpdated: vi.fn(() => vi.fn()),
  },
}))

type RecruitPoolsState = ReturnType<typeof useRecruitPools>

describe('useRecruitPools', () => {
  let state: RecruitPoolsState

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mountComposable = async () => {
    const Wrapper = defineComponent({
      setup() {
        state = useRecruitPools()
        return () => null
      },
    })
    mount(Wrapper)
    await flushPromises()
  }

  it('uses rate boost maps for sorting and probability calculation', async () => {
    await mountComposable()

    expect(state.sortedStudents.value.map((student) => student.name)).toEqual(['阿罗娜', '白子'])
    expect(state.getBoostMultiplier('阿罗娜')).toBe(4)
    expect(state.calculateProb('阿罗娜', 1)).toBe('66.67')
    expect(state.calculateProb('白子', 2)).toBe('33.33')
  })
})
