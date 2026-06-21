import { convertFileSrc } from '@tauri-apps/api/core'

export type AssetKind = 'image' | 'audio' | 'video' | 'asset'

const WINDOWS_ABSOLUTE_RE = /^[a-zA-Z]:[\\/]/

export function resolveAssetUrl(path?: string | null): string {
  const value = String(path || '').trim()
  if (!value) return ''
  if (/^(https?:|data:|blob:)/i.test(value)) return value
  if (value.startsWith('/')) return value
  if (WINDOWS_ABSOLUTE_RE.test(value) || value.startsWith('\\\\')) {
    return convertFileSrc(value)
  }
  return `/${value.replace(/^public[\\/]/, '').replace(/\\/g, '/')}`
}
