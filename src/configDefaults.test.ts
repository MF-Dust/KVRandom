import { describe, it, expect } from 'vitest'
import {
  createDefaultConfig,
  DEFAULT_ADMIN_TASK_NAME,
  DEFAULT_PICK_COUNT,
  MAX_PICK_COUNT,
  MIN_PICK_COUNT,
} from './configDefaults'

describe('createDefaultConfig', () => {
  it('returns an empty student list and default true allowRepeatDraw', () => {
    const cfg = createDefaultConfig()
    expect(cfg.studentList).toEqual([])
    expect(cfg.allowRepeatDraw).toBe(true)
  })

  it('floats default pick count between MIN_PICK_COUNT and MAX_PICK_COUNT', () => {
    const cfg = createDefaultConfig()
    expect(cfg.pickCountDialog.defaultCount).toBeGreaterThanOrEqual(MIN_PICK_COUNT)
    expect(cfg.pickCountDialog.defaultCount).toBeLessThanOrEqual(MAX_PICK_COUNT)
    expect(cfg.pickCountDialog.defaultCount).toBe(DEFAULT_PICK_COUNT)
  })

  it('produces independent instances on each call', () => {
    const a = createDefaultConfig()
    const b = createDefaultConfig()
    expect(a).not.toBe(b)
    expect(a.floatingButton).not.toBe(b.floatingButton)
    expect(a.studentList).not.toBe(b.studentList)
  })

  it('uses DEFAULT_ADMIN_TASK_NAME for web admin task name', () => {
    const cfg = createDefaultConfig()
    expect(cfg.webConfig.adminAutoStartTaskName).toBe(DEFAULT_ADMIN_TASK_NAME)
  })

  it('keeps floating button at full mode with null position by default', () => {
    const cfg = createDefaultConfig()
    expect(cfg.floatingButton.mode).toBe('full')
    expect(cfg.floatingButton.position.x).toBeNull()
    expect(cfg.floatingButton.position.y).toBeNull()
  })
})
