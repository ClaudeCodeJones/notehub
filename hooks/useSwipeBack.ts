import { useEffect, useRef, useCallback } from 'react'

export function useSwipeBack(onBack: () => void, enabled: boolean) {
  const startX = useRef<number | null>(null)
  const startY = useRef<number | null>(null)

  const stableOnBack = useCallback(onBack, [onBack])

  useEffect(() => {
    if (!enabled) return

    function onTouchStart(e: TouchEvent) {
      // Only activate from the left 44px edge (mirrors iOS back gesture zone)
      if (e.touches[0].clientX <= 44) {
        startX.current = e.touches[0].clientX
        startY.current = e.touches[0].clientY
      }
    }

    function onTouchEnd(e: TouchEvent) {
      if (startX.current === null) return
      const dx = e.changedTouches[0].clientX - startX.current
      const dy = Math.abs(e.changedTouches[0].clientY - (startY.current ?? 0))
      // Right swipe ≥60px, not too much vertical drift
      if (dx >= 60 && dy < 80) {
        stableOnBack()
      }
      startX.current = null
      startY.current = null
    }

    document.addEventListener('touchstart', onTouchStart, { passive: true })
    document.addEventListener('touchend', onTouchEnd, { passive: true })
    return () => {
      document.removeEventListener('touchstart', onTouchStart)
      document.removeEventListener('touchend', onTouchEnd)
    }
  }, [enabled, stableOnBack])
}
