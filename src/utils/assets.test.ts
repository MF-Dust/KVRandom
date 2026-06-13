import { describe, it, expect, vi, beforeEach } from 'vitest'
import { resolveAssetUrl, firstAssetPath } from './assets'

// Mock @tauri-apps/api/core
vi.mock('@tauri-apps/api/core', () => ({
  convertFileSrc: (path: string) => `asset://localhost/${path.replace(/\\/g, '/')}`,
}))

describe('resolveAssetUrl', () => {
  it('returns empty string for null or empty paths', () => {
    expect(resolveAssetUrl(null)).toBe('')
    expect(resolveAssetUrl(undefined)).toBe('')
    expect(resolveAssetUrl('')).toBe('')
    expect(resolveAssetUrl('   ')).toBe('')
  })

  it('preserves URLs with http/https/data/blob protocols', () => {
    expect(resolveAssetUrl('https://example.com/video.mp4')).toBe('https://example.com/video.mp4')
    expect(resolveAssetUrl('http://example.com/audio.mp3')).toBe('http://example.com/audio.mp3')
    expect(resolveAssetUrl('data:image/png;base64,abc')).toBe('data:image/png;base64,abc')
    expect(resolveAssetUrl('blob:http://localhost/123')).toBe('blob:http://localhost/123')
  })

  it('preserves paths starting with /', () => {
    expect(resolveAssetUrl('/image/random.svg')).toBe('/image/random.svg')
    expect(resolveAssetUrl('/sound/bgm.mp3')).toBe('/sound/bgm.mp3')
  })

  it('converts Windows absolute paths using convertFileSrc', () => {
    const windowsPath = 'C:\\Users\\Test\\Videos\\recruit.mp4'
    const result = resolveAssetUrl(windowsPath)
    expect(result).toContain('asset://localhost/')
    expect(result).toContain('C:/Users/Test/Videos/recruit.mp4')
  })

  it('converts UNC paths using convertFileSrc', () => {
    const uncPath = '\\\\server\\share\\video.mp4'
    const result = resolveAssetUrl(uncPath)
    expect(result).toContain('asset://localhost/')
  })

  it('converts relative paths to absolute paths with leading /', () => {
    expect(resolveAssetUrl('image/icon.png')).toBe('/image/icon.png')
    expect(resolveAssetUrl('sound/click.wav')).toBe('/sound/click.wav')
  })

  it('strips "public/" prefix from relative paths', () => {
    expect(resolveAssetUrl('public/image/icon.png')).toBe('/image/icon.png')
    expect(resolveAssetUrl('public\\image\\icon.png')).toBe('/image/icon.png')
  })

  it('normalizes backslashes to forward slashes in relative paths', () => {
    expect(resolveAssetUrl('image\\subfolder\\icon.png')).toBe('/image/subfolder/icon.png')
  })
})

describe('firstAssetPath', () => {
  it('returns first non-empty path', () => {
    expect(firstAssetPath(['', 'path1', 'path2'])).toBe('path1')
    expect(firstAssetPath([null as any, '', '  ', 'valid'], '')).toBe('valid')
  })

  it('returns fallback when no valid paths', () => {
    expect(firstAssetPath([], 'fallback')).toBe('fallback')
    expect(firstAssetPath(['', '  '], 'default')).toBe('default')
    expect(firstAssetPath(null, 'none')).toBe('none')
  })

  it('returns empty string as default fallback', () => {
    expect(firstAssetPath([])).toBe('')
    expect(firstAssetPath(null)).toBe('')
  })
})
