import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useRecruitCurrencies } from './useRecruitCurrencies'
import { nextTick } from 'vue'

// Mock audioApi
vi.mock('../api/audioApi', () => ({
  audioApi: {
    playClickSoundSafely: vi.fn(),
  },
}))

describe('useRecruitCurrencies', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    // Mock window.alert
    vi.stubGlobal('alert', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('initializes with default currency values', () => {
    const { currencies } = useRecruitCurrencies()

    expect(currencies.value.pyroxene).toBe(12000)
    expect(currencies.value.credit).toBe(50000000)
    expect(currencies.value.ap).toBe(120)
    expect(currencies.value.selectionTicket).toBe(1)
    expect(currencies.value.recruitTicket1).toBe(5)
    expect(currencies.value.recruitTicket10).toBe(1)
  })

  it('loads saved currencies from localStorage', async () => {
    const savedData = {
      pyroxene: 5000,
      credit: 1000000,
      ap: 50,
      selectionTicket: 3,
      recruitTicket1: 10,
      recruitTicket10: 2,
    }
    localStorage.setItem('ba_recruit_currencies', JSON.stringify(savedData))

    const { currencies } = useRecruitCurrencies()

    // Wait for onMounted to execute
    await nextTick()

    expect(currencies.value.pyroxene).toBe(5000)
    expect(currencies.value.credit).toBe(1000000)
    expect(currencies.value.ap).toBe(50)
  })

  it('saves currencies to localStorage', () => {
    const { currencies, saveCurrencies } = useRecruitCurrencies()

    currencies.value.pyroxene = 20000
    saveCurrencies()

    const saved = JSON.parse(localStorage.getItem('ba_recruit_currencies') || '{}')
    expect(saved.pyroxene).toBe(20000)
  })

  it('opens replenish dialog with correct target', () => {
    const { showReplenishDialog, replenishTarget, openReplenish } = useRecruitCurrencies()

    expect(showReplenishDialog.value).toBe(false)

    openReplenish('pyroxene')

    expect(showReplenishDialog.value).toBe(true)
    expect(replenishTarget.value).toBe('pyroxene')
  })

  it('closes replenish dialog and clears target', () => {
    const { showReplenishDialog, replenishTarget, openReplenish, closeReplenishDialog } =
      useRecruitCurrencies()

    openReplenish('credit')
    expect(showReplenishDialog.value).toBe(true)

    closeReplenishDialog()

    expect(showReplenishDialog.value).toBe(false)
    expect(replenishTarget.value).toBe('')
  })

  it('confirms replenish and adds currency', () => {
    const { currencies, openReplenish, confirmReplenish } = useRecruitCurrencies()

    const initialPyroxene = currencies.value.pyroxene

    openReplenish('pyroxene')
    confirmReplenish()

    expect(currencies.value.pyroxene).toBe(initialPyroxene + 1200)
  })

  it('confirms replenish and sets currency for AP', () => {
    const { currencies, openReplenish, confirmReplenish } = useRecruitCurrencies()

    currencies.value.ap = 50

    openReplenish('ap')
    confirmReplenish()

    expect(currencies.value.ap).toBe(120) // AP is set, not added
  })

  it('handles ticket purchase with credit cost', async () => {
    const { currencies, openReplenish, confirmReplenish } = useRecruitCurrencies()

    const initialCredit = currencies.value.credit
    const initialTicket = currencies.value.selectionTicket

    openReplenish('ticket')
    confirmReplenish()

    await nextTick()

    expect(currencies.value.credit).toBe(initialCredit - 30000000)
    expect(currencies.value.selectionTicket).toBe(initialTicket + 1)
  })

  it('prevents ticket purchase when credit is insufficient', async () => {
    const { currencies, openReplenish, confirmReplenish } = useRecruitCurrencies()

    currencies.value.credit = 1000 // Insufficient
    const initialTicket = currencies.value.selectionTicket

    openReplenish('ticket')
    confirmReplenish()

    await nextTick()

    expect(window.alert).toHaveBeenCalled()
    expect(currencies.value.selectionTicket).toBe(initialTicket) // Unchanged
  })
})
