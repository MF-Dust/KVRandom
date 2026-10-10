import type { GlobalThemeOverrides } from 'naive-ui'

/** Default Blue Archive brand blue, mirrored by `--ba-blue` in styles/tokens.css. */
export const DEFAULT_THEME_COLOR = '#128afa'

type Rgb = [number, number, number]

const WHITE: Rgb = [255, 255, 255]
const NAVY: Rgb = [0, 42, 102]

const INK_STRONG = '#102b4c'
const INK = '#1f3a5f'
const MUTED = '#5a7597'
const LINE = '#d5e3f0'
const LINE_SOFT = '#e7eff7'

/** Parses `#rgb`, `#rrggbb` and `rgb()/rgba()` colours; anything else yields null. */
export function parseColor(input: string | null | undefined): Rgb | null {
  if (!input) return null
  const value = input.trim()

  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value)
  if (hex) {
    const digits = hex[1].length === 3 ? [...hex[1]].map((d) => d + d).join('') : hex[1]
    return [0, 2, 4].map((offset) => parseInt(digits.slice(offset, offset + 2), 16)) as Rgb
  }

  const rgb =
    /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*[\d.]+%?\s*)?\)$/i.exec(value)
  if (rgb) {
    const channels = rgb.slice(1, 4).map(Number)
    if (channels.every((channel) => channel <= 255)) return channels as Rgb
  }

  return null
}

/** Linear blend from `color` towards `target`; ratio 0 keeps `color`, 1 yields `target`. */
export function mixColor(color: Rgb, target: Rgb, ratio: number): Rgb {
  const weight = Math.max(0, Math.min(1, ratio))
  return color.map((channel, index) =>
    Math.round(channel + (target[index] - channel) * weight)
  ) as Rgb
}

export function toHex(color: Rgb): string {
  return `#${color.map((channel) => channel.toString(16).padStart(2, '0')).join('')}`
}

const withAlpha = ([r, g, b]: Rgb, alpha: number) => `rgba(${r}, ${g}, ${b}, ${alpha})`

/**
 * Naive UI overrides in the Blue Archive style. The primary colour follows the
 * user-configurable theme colour so form controls match the custom CSS shell.
 */
export function createNaiveThemeOverrides(themeColor?: string | null): GlobalThemeOverrides {
  const base = parseColor(themeColor) ?? (parseColor(DEFAULT_THEME_COLOR) as Rgb)
  const primary = toHex(base)
  const hover = toHex(mixColor(base, WHITE, 0.22))
  const pressed = toHex(mixColor(base, NAVY, 0.2))
  const focusRing = `0 0 0 3px ${withAlpha(base, 0.16)}`
  const handleShadow = `0 0 0 2px ${primary}, 0 2px 6px ${withAlpha(base, 0.35)}`

  return {
    common: {
      primaryColor: primary,
      primaryColorHover: hover,
      primaryColorPressed: pressed,
      primaryColorSuppl: hover,
      infoColor: primary,
      infoColorHover: hover,
      infoColorPressed: pressed,
      infoColorSuppl: hover,
      successColor: '#2fbf7a',
      successColorHover: '#4fd394',
      successColorPressed: '#239a62',
      successColorSuppl: '#4fd394',
      // Deeper amber than the BA CTA yellow: Naive renders it as text on tags and
      // secondary buttons, where the bright yellow would be unreadable.
      warningColor: '#d48c00',
      warningColorHover: '#e8a316',
      warningColorPressed: '#b57600',
      warningColorSuppl: '#e8a316',
      errorColor: '#ef5470',
      errorColorHover: '#f57a90',
      errorColorPressed: '#cf3c58',
      errorColorSuppl: '#f57a90',
      textColor1: INK_STRONG,
      textColor2: INK,
      textColor3: MUTED,
      placeholderColor: '#a3b5c9',
      borderColor: LINE,
      dividerColor: LINE_SOFT,
      borderRadius: '6px',
      borderRadiusSmall: '4px',
      fontFamily: 'var(--ba-font)',
      fontWeightStrong: '700',
      fontSize: '14px',
    },
    Button: {
      borderRadiusTiny: '4px',
      borderRadiusSmall: '5px',
      borderRadiusMedium: '6px',
      borderRadiusLarge: '8px',
      fontWeight: '600',
      fontWeightStrong: '800',
      textColorWarning: INK_STRONG,
      textColorHoverWarning: INK_STRONG,
      textColorPressedWarning: INK_STRONG,
      textColorFocusWarning: INK_STRONG,
    },
    Input: {
      borderRadius: '6px',
      border: `1px solid ${LINE}`,
      borderHover: `1px solid ${hover}`,
      borderFocus: `1px solid ${primary}`,
      boxShadowFocus: focusRing,
      color: '#fbfdff',
      colorFocus: '#ffffff',
    },
    InternalSelection: {
      borderRadius: '6px',
      border: `1px solid ${LINE}`,
      borderHover: `1px solid ${hover}`,
      borderActive: `1px solid ${primary}`,
      borderFocus: `1px solid ${primary}`,
      boxShadowActive: focusRing,
      boxShadowFocus: focusRing,
      color: '#fbfdff',
    },
    Switch: {
      railColorActive: primary,
      boxShadowFocus: focusRing,
    },
    Slider: {
      fillColor: primary,
      fillColorHover: hover,
      railColor: '#dbe7f2',
      railColorHover: '#cfdeed',
      handleColor: '#ffffff',
      handleBoxShadow: handleShadow,
      handleBoxShadowHover: handleShadow,
      handleBoxShadowActive: `0 0 0 3px ${primary}, 0 2px 8px ${withAlpha(base, 0.4)}`,
      handleBoxShadowFocus: `${handleShadow}, 0 0 0 6px ${withAlpha(base, 0.16)}`,
      indicatorColor: INK_STRONG,
    },
    Radio: {
      buttonBorderRadius: '6px',
      buttonColorActive: primary,
      buttonTextColorActive: '#ffffff',
      buttonBorderColorActive: primary,
      buttonTextColorHover: primary,
      labelFontWeight: '600',
    },
    Tag: {
      borderRadius: '4px',
      fontWeightStrong: '700',
    },
    Collapse: {
      titleFontWeight: '700',
      titleTextColor: INK_STRONG,
      dividerColor: LINE_SOFT,
    },
    Card: {
      borderRadius: '10px',
      titleFontWeight: '800',
      titleTextColor: INK_STRONG,
      titleFontSizeHuge: '18px',
    },
  }
}
