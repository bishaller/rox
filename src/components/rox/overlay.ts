import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react'

/** Viewport coordinates an overlay is summoned from. */
export type Anchor = { x: number; y: number }

/** Keeps an overlay off the very edge of the window when it has to be pulled in. */
const GUTTER = 8

/**
 * Shared behaviour for overlays anchored to a point: clamp into the viewport,
 * and dismiss on Escape, an outside press, or a resize.
 *
 * Returns the ref to put on the overlay and the corrected position. Measure
 * happens in a layout effect so the correction lands before paint — an overlay
 * opened near the right or bottom edge never visibly jumps.
 */
export function useAnchoredOverlay({
  anchor, onClose, closeOnScroll = false, trigger,
}: {
  anchor: Anchor
  onClose: () => void
  /**
   * Menus follow their trigger and should go when the page moves under them.
   * Panels the user is filling in should not — the table scrolling beneath a
   * filter panel is not a reason to throw away what they were typing.
   */
  closeOnScroll?: boolean
  /**
   * The control that opened this. Presses on it are left alone so it can
   * toggle: without this, the dismiss below fires on pointerdown, the trigger's
   * own click then sees a closed overlay, and clicking it to close reopens it.
   */
  trigger?: RefObject<HTMLElement | null>
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState(anchor)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    /* offsetWidth/offsetHeight, not getBoundingClientRect: the rect is taken
       mid-entrance, while the menu is still scaled down, and would under-
       measure it. Offset sizes are layout sizes — transforms don't touch them. */
    const { offsetWidth: width, offsetHeight: height } = el
    setPos({
      x: Math.max(GUTTER, Math.min(anchor.x, window.innerWidth - width - GUTTER)),
      y: Math.max(GUTTER, Math.min(anchor.y, window.innerHeight - height - GUTTER)),
    })
  }, [anchor])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); onClose() }
    }
    /* Capture phase: a press anywhere else should dismiss before whatever was
       pressed reacts to it. */
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node
      if (ref.current?.contains(target)) return
      if (trigger?.current?.contains(target)) return
      onClose()
    }

    window.addEventListener('keydown', onKey, true)
    window.addEventListener('pointerdown', onPointerDown, true)
    window.addEventListener('resize', onClose)
    if (closeOnScroll) window.addEventListener('scroll', onClose, true)
    return () => {
      window.removeEventListener('keydown', onKey, true)
      window.removeEventListener('pointerdown', onPointerDown, true)
      window.removeEventListener('resize', onClose)
      if (closeOnScroll) window.removeEventListener('scroll', onClose, true)
    }
  }, [onClose, closeOnScroll, trigger])

  return { ref, pos }
}
