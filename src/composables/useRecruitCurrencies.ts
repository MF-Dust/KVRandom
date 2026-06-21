import { ref } from 'vue'
import { audioApi } from '../api/audioApi'

interface Currencies {
  pyroxene: number
  credit: number
  ap: number
  selectionTicket: number
  recruitTicket1: number
  recruitTicket10: number
}

type CurrencyKey = keyof Currencies

const REPLENISH_CONFIG = {
  pyroxene: { amount: 1200, operation: 'add' as const },
  credit: { amount: 10000000, operation: 'add' as const },
  ap: { amount: 120, operation: 'set' as const },
  recruitTicket1: { amount: 10, operation: 'add' as const },
  recruitTicket10: { amount: 2, operation: 'add' as const },
  ticket: {
    amount: 1,
    operation: 'add' as const,
    cost: { currency: 'credit' as const, amount: 30000000 },
  },
} as const

type ReplenishTarget = keyof typeof REPLENISH_CONFIG

const STORAGE_KEY = 'ba_recruit_currencies'

const isReplenishTarget = (target: string): target is ReplenishTarget => {
  return target in REPLENISH_CONFIG
}

export function useRecruitCurrencies() {
  const currencies = ref<Currencies>({
    pyroxene: 12000,
    credit: 50000000,
    ap: 120,
    selectionTicket: 1,
    recruitTicket1: 5,
    recruitTicket10: 1,
  })

  const showReplenishDialog = ref(false)
  const replenishTarget = ref('')

  const loadCurrencies = () => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        currencies.value = {
          pyroxene: parsed.pyroxene ?? 12000,
          credit: parsed.credit ?? 50000000,
          ap: parsed.ap ?? 120,
          selectionTicket: parsed.selectionTicket ?? 1,
          recruitTicket1: parsed.recruitTicket1 ?? 5,
          recruitTicket10: parsed.recruitTicket10 ?? 1,
        }
      } catch (err) {
        console.error('Failed to parse saved currencies:', err)
      }
    }
  }

  const saveCurrencies = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currencies.value))
  }

  const openReplenish = (target: string) => {
    audioApi.playClickSoundSafely()
    replenishTarget.value = target
    showReplenishDialog.value = true
  }

  const closeReplenishDialog = () => {
    audioApi.playClickSoundSafely()
    showReplenishDialog.value = false
    replenishTarget.value = ''
  }

  const confirmReplenish = () => {
    audioApi.playClickSoundSafely()

    if (!isReplenishTarget(replenishTarget.value)) {
      console.warn('Unknown replenish target:', replenishTarget.value)
      closeReplenishDialog()
      return
    }
    const target = replenishTarget.value
    const config = REPLENISH_CONFIG[target]

    // Check if there's a cost requirement
    if ('cost' in config && config.cost) {
      const { currency, amount: costAmount } = config.cost
      if (currencies.value[currency] < costAmount) {
        alert('老师，信用积分不足以购买自选券哦！点击加号补充一下信用积分吧～')
        closeReplenishDialog()
        return
      }
      currencies.value[currency] -= costAmount
    }

    // Apply the replenishment - handle 'ticket' -> 'selectionTicket' mapping
    const currencyKey: CurrencyKey = target === 'ticket' ? 'selectionTicket' : target
    if (config.operation === 'add') {
      currencies.value[currencyKey] += config.amount
    } else if (config.operation === 'set') {
      currencies.value[currencyKey] = config.amount
    }

    saveCurrencies()
    closeReplenishDialog()
  }

  // Load currencies immediately (works in both production and test)
  loadCurrencies()

  return {
    currencies,
    showReplenishDialog,
    replenishTarget,
    saveCurrencies,
    openReplenish,
    closeReplenishDialog,
    confirmReplenish,
  }
}
