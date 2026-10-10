import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useFloatingDrag } from './useFloatingDrag'
import { floatingButtonApi } from '../api/floatingButtonApi'

vi.mock('../api/floatingButtonApi', () => ({
  floatingButtonApi: {
    dragMouse: vi.fn().mockResolvedValue(undefined),
    startDrag: vi.fn().mockResolvedValue(undefined),
    moveDrag: vi.fn().mockResolvedValue(undefined),
    endDrag: vi.fn().mockResolvedValue(undefined),
  },
}))
vi.mock('../api/audioApi', () => ({
  audioApi: { playClickSound: vi.fn().mockResolvedValue(undefined) },
}))

const pointer = (x: number, pointerType = 'mouse') =>
  ({
    pointerId: 1,
    pointerType,
    button: 0,
    buttons: 1,
    screenX: x,
    screenY: 0,
    clientX: x,
    clientY: 0,
  }) as PointerEvent
const settle = async () => {
  for (let i = 0; i < 20; i++) await Promise.resolve()
}

describe('floating drag', () => {
  let frames: FrameRequestCallback[]
  const frame = () => frames.splice(0).forEach((callback) => callback(0))

  beforeEach(() => {
    vi.clearAllMocks()
    frames = []
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      frames.push(callback)
      return frames.length
    })
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {
      frames = []
    })
  })
  afterEach(() => vi.restoreAllMocks())

  it('lets Windows finish mouse dragging despite WebView capture loss or pointerup', async () => {
    let release!: () => void
    vi.mocked(floatingButtonApi.dragMouse).mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          release = resolve
        })
    )
    const emit = vi.fn()
    const drag = useFloatingDrag(emit)
    drag.handlePointerDown(pointer(0))
    drag.handlePointerMove(pointer(10))
    drag.handlePointerCancel(pointer(10))
    await drag.handlePointerUp(pointer(10))
    drag.handlePointerMove(pointer(100))
    expect(drag.isDragging.value).toBe(true)
    expect(floatingButtonApi.dragMouse).toHaveBeenCalledOnce()
    expect(floatingButtonApi.moveDrag).not.toHaveBeenCalled()
    expect(floatingButtonApi.endDrag).not.toHaveBeenCalled()
    release()
    await settle()
    expect(drag.isDragging.value).toBe(false)
    expect(emit).not.toHaveBeenCalled()
  })

  it('still emits a click below the drag threshold', async () => {
    const emit = vi.fn()
    const drag = useFloatingDrag(emit)
    drag.handlePointerDown(pointer(0))
    drag.handlePointerMove(pointer(1))
    await drag.handlePointerUp(pointer(1))
    expect(emit).toHaveBeenCalledWith('click')
    expect(floatingButtonApi.dragMouse).not.toHaveBeenCalled()
  })

  it('coalesces touch moves while a native command is pending', async () => {
    let release!: () => void
    vi.mocked(floatingButtonApi.moveDrag).mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          release = resolve
        })
    )
    const drag = useFloatingDrag(vi.fn())
    drag.handlePointerDown(pointer(0, 'touch'))
    drag.handlePointerMove(pointer(10, 'touch'))
    frame()
    await settle()
    for (let x = 20; x <= 100; x += 10) {
      drag.handlePointerMove(pointer(x, 'touch'))
      frame()
    }
    expect(floatingButtonApi.moveDrag).toHaveBeenCalledTimes(1)
    release()
    await settle()
    frame()
    await settle()
    expect(floatingButtonApi.moveDrag).toHaveBeenCalledTimes(2)
    expect(floatingButtonApi.moveDrag).toHaveBeenLastCalledWith(100, 0)
    await drag.handlePointerUp(pointer(100, 'touch'))
    expect(floatingButtonApi.endDrag).toHaveBeenCalledOnce()
  })

  it('ends touch dragging on cancellation without emitting a click', async () => {
    const emit = vi.fn()
    const drag = useFloatingDrag(emit)
    drag.handlePointerDown(pointer(0, 'touch'))
    drag.handlePointerMove(pointer(10, 'touch'))
    drag.handlePointerCancel(pointer(10, 'touch'))
    await settle()
    expect(drag.isDragging.value).toBe(false)
    expect(floatingButtonApi.endDrag).toHaveBeenCalledOnce()
    expect(emit).not.toHaveBeenCalled()
  })
})
