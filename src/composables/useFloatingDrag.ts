import { ref } from 'vue'
import { audioApi } from '../api/audioApi'
import { floatingButtonApi } from '../api/floatingButtonApi'

type FloatingEmit = (event: 'click') => void
type DragTask = () => Promise<unknown> | unknown
type FloatingDragOptions = {
  clickSoundEnabled?: () => boolean
  clickSoundPath?: () => string
  clickSoundVolume?: () => number
  dragThresholdPx?: () => number
}

export function useFloatingDrag(emit: FloatingEmit, options: FloatingDragOptions = {}) {
  const pointerDown = ref(false)
  const activePointerId = ref<number | null>(null)
  const isDragging = ref(false)
  const startGlobalX = ref(0)
  const startGlobalY = ref(0)
  const pendingDx = ref(0)
  const pendingDy = ref(0)
  const rafId = ref(0)
  let dragCommandQueue: Promise<unknown> = Promise.resolve()
  let moveQueued = false
  let nativeDragging = false

  const enqueueDragCommand = (task: DragTask) => {
    dragCommandQueue = dragCommandQueue
      .catch(() => {})
      .then(task)
      .catch((error) => {
        console.warn('Floating drag command failed:', error)
      })
    return dragCommandQueue
  }

  const playClickSound = () => {
    if (options.clickSoundEnabled?.() === false) return
    audioApi
      .playClickSound(
        options.clickSoundPath?.() || 'sound/button_click.wav',
        options.clickSoundVolume?.() ?? 1
      )
      .catch(() => {})
  }

  const getGlobalPoint = (event: PointerEvent) => {
    const fallbackX = window.screenX + event.clientX
    const fallbackY = window.screenY + event.clientY

    if (event.pointerType === 'touch') {
      return { x: fallbackX, y: fallbackY }
    }

    const screenX = Number(event.screenX)
    const screenY = Number(event.screenY)
    return {
      x: Number.isFinite(screenX) ? screenX : fallbackX,
      y: Number.isFinite(screenY) ? screenY : fallbackY,
    }
  }

  const flushMove = () => {
    if (!isDragging.value) {
      rafId.value = 0
      return
    }
    rafId.value = 0
    if (moveQueued) return
    moveQueued = true
    let sentDx = pendingDx.value
    let sentDy = pendingDy.value
    enqueueDragCommand(() => {
      sentDx = pendingDx.value
      sentDy = pendingDy.value
      return floatingButtonApi.moveDrag(sentDx, sentDy)
    }).finally(() => {
      moveQueued = false
      if (isDragging.value && (sentDx !== pendingDx.value || sentDy !== pendingDy.value)) {
        scheduleMove()
      }
    })
  }

  const scheduleMove = () => {
    if (rafId.value !== 0) return
    rafId.value = window.requestAnimationFrame(flushMove)
  }

  const cancelScheduledMove = () => {
    if (rafId.value !== 0) {
      window.cancelAnimationFrame(rafId.value)
      rafId.value = 0
    }
  }

  const handlePointerDown = (event: PointerEvent) => {
    if (nativeDragging) return
    if (event.pointerType === 'mouse' && event.button !== 0) return
    pointerDown.value = true
    activePointerId.value = event.pointerId
    isDragging.value = false
    const point = getGlobalPoint(event)
    startGlobalX.value = point.x
    startGlobalY.value = point.y
    pendingDx.value = 0
    pendingDy.value = 0
    cancelScheduledMove()
    const target = event.currentTarget as Element | null
    if (target && 'setPointerCapture' in target) {
      target.setPointerCapture(event.pointerId)
    }
  }

  const handlePointerMove = (event: PointerEvent) => {
    if (nativeDragging || activePointerId.value !== event.pointerId) return
    if (!pointerDown.value) return

    const point = getGlobalPoint(event)
    const dx = point.x - startGlobalX.value
    const dy = point.y - startGlobalY.value
    const threshold = Math.max(0, Number(options.dragThresholdPx?.() ?? 3) || 3)
    const movedEnough = Math.abs(dx) >= threshold || Math.abs(dy) >= threshold

    if (!isDragging.value && movedEnough) {
      isDragging.value = true
      if (event.pointerType === 'mouse') {
        nativeDragging = true
        const target = event.currentTarget as Element | null
        if (target?.hasPointerCapture?.(event.pointerId)) {
          target.releasePointerCapture(event.pointerId)
        }
        floatingButtonApi
          .dragMouse()
          .catch((error) => {
            console.warn('Floating native drag failed:', error)
          })
          .finally(() => {
            nativeDragging = false
            pointerDown.value = false
            activePointerId.value = null
            isDragging.value = false
          })
        return
      }
      enqueueDragCommand(() => floatingButtonApi.startDrag())
    }

    if (isDragging.value) {
      pendingDx.value = dx
      pendingDy.value = dy
      scheduleMove()
    }
  }

  const handlePointerUp = async (event: PointerEvent) => {
    if (nativeDragging) return
    if (activePointerId.value !== event.pointerId) return
    if (!pointerDown.value) return

    let finishDrag: Promise<unknown> | null = null
    if (isDragging.value) {
      cancelScheduledMove()
      const finalDx = pendingDx.value
      const finalDy = pendingDy.value
      finishDrag = enqueueDragCommand(async () => {
        await floatingButtonApi.moveDrag(finalDx, finalDy)
        await floatingButtonApi.endDrag()
      })
    } else {
      playClickSound()
      emit('click')
    }

    pointerDown.value = false
    activePointerId.value = null
    isDragging.value = false
    const target = event.currentTarget as Element | null
    if (target && 'releasePointerCapture' in target) {
      target.releasePointerCapture(event.pointerId)
    }
    if (finishDrag) {
      await finishDrag
    }
  }

  const handlePointerCancel = (event: PointerEvent) => {
    if (nativeDragging) return
    if (activePointerId.value !== null && activePointerId.value !== event.pointerId) return
    if (isDragging.value) {
      cancelScheduledMove()
      enqueueDragCommand(() => floatingButtonApi.endDrag())
    }
    pointerDown.value = false
    activePointerId.value = null
    isDragging.value = false
  }

  return {
    isDragging,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
  }
}
