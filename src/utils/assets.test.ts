import { describe, it, expect } from 'vitest'
import { resolveAssetUrl } from './assets'

describe('resolveAssetUrl', () => {
  it('returns empty string for null or empty paths', () => {
    for (const path of [null, undefined, '', '   ']) expect(resolveAssetUrl(path)).toBe('')
  })

  it('preserves web, data, blob URLs and bundled paths', () => {
    for (const path of [
      'https://example.com/video.mp4',
      'http://example.com/audio.mp3',
      'data:image/png;base64,abc',
      'blob:http://localhost/123',
      '/image/random.svg',
      '/sound/bgm.mp3',
    ]) {
      expect(resolveAssetUrl(path)).toBe(path)
    }
  })

  it('encodes Windows and UNC paths for the native asset origin', () => {
    for (const path of [
      'C:\\Users\\Test\\Videos\\recruit.mp4',
      '\\\\server\\share\\video.mp4',
      'D:\\立绘\\a #1.png',
    ]) {
      expect(resolveAssetUrl(path)).toBe(
        `https://assets.kvrandom.local/file?path=${encodeURIComponent(path)}`
      )
    }
  })

  it('normalizes bundled relative paths', () => {
    expect(resolveAssetUrl('image/icon.png')).toBe('/image/icon.png')
    expect(resolveAssetUrl('sound/click.wav')).toBe('/sound/click.wav')
    expect(resolveAssetUrl('public/image/icon.png')).toBe('/image/icon.png')
    expect(resolveAssetUrl('public\\image\\icon.png')).toBe('/image/icon.png')
    expect(resolveAssetUrl('image\\subfolder\\icon.png')).toBe('/image/subfolder/icon.png')
  })
})
