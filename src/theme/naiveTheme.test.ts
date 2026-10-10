import { describe, expect, it } from 'vitest'
import {
  DEFAULT_THEME_COLOR,
  createNaiveThemeOverrides,
  mixColor,
  parseColor,
  toHex,
} from './naiveTheme'

describe('parseColor', () => {
  it('parses short and long hex colours', () => {
    expect(parseColor('#128afa')).toEqual([18, 138, 250])
    expect(parseColor('#FFF')).toEqual([255, 255, 255])
    expect(parseColor('  #0068DF ')).toEqual([0, 104, 223])
  })

  it('parses rgb() and rgba() colours', () => {
    expect(parseColor('rgb(18, 138, 250)')).toEqual([18, 138, 250])
    expect(parseColor('rgba(1,2,3,0.5)')).toEqual([1, 2, 3])
  })

  it('rejects unsupported or invalid input', () => {
    expect(parseColor('')).toBeNull()
    expect(parseColor(undefined)).toBeNull()
    expect(parseColor('#12345')).toBeNull()
    expect(parseColor('rgb(300, 0, 0)')).toBeNull()
    expect(parseColor('hsl(210, 96%, 52%)')).toBeNull()
    expect(parseColor('linear-gradient(#fff, #000)')).toBeNull()
  })
})

describe('mixColor / toHex', () => {
  it('blends towards the target colour and clamps the ratio', () => {
    expect(toHex(mixColor([0, 0, 0], [255, 255, 255], 0.5))).toBe('#808080')
    expect(mixColor([10, 20, 30], [255, 255, 255], 0)).toEqual([10, 20, 30])
    expect(mixColor([10, 20, 30], [255, 255, 255], 2)).toEqual([255, 255, 255])
  })
})

describe('createNaiveThemeOverrides', () => {
  it('uses the configured theme colour as primary', () => {
    const overrides = createNaiveThemeOverrides('#ff7ac6')
    expect(overrides.common?.primaryColor).toBe('#ff7ac6')
    expect(overrides.Switch?.railColorActive).toBe('#ff7ac6')
    expect(overrides.Slider?.fillColor).toBe('#ff7ac6')
  })

  it('falls back to the Blue Archive blue for unusable colours', () => {
    expect(createNaiveThemeOverrides('not-a-colour').common?.primaryColor).toBe(DEFAULT_THEME_COLOR)
    expect(createNaiveThemeOverrides(undefined).common?.primaryColor).toBe(DEFAULT_THEME_COLOR)
  })

  it('derives distinct hover and pressed shades', () => {
    const { common } = createNaiveThemeOverrides(DEFAULT_THEME_COLOR)
    expect(common?.primaryColorHover).not.toBe(DEFAULT_THEME_COLOR)
    expect(common?.primaryColorPressed).not.toBe(DEFAULT_THEME_COLOR)
    expect(common?.primaryColorHover).toMatch(/^#[0-9a-f]{6}$/)
    expect(common?.primaryColorPressed).toMatch(/^#[0-9a-f]{6}$/)
  })
})
