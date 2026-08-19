import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/cn'

/**
 * The frame's tooltip (node 3764:6794): a stone-800 pill with a 12×6 arrow
 * pointing back at what summoned it, sitting centred below the target.
 *
 * One floating element is shared by every <Tooltip> on the page. Hopping
 * between adjacent targets keeps that element mounted and glides it to the
 * new anchor — per-instance tooltips would unmount and replay the entrance
 * at the new spot, which reads as a left/right jump.
 *
 * Portalled — the view-tab pills and the strip are both `overflow-hidden`,
 * and a tooltip rendered inside them would be clipped.
 */

type TooltipState = { label: string; x: number; y: number; source: number }

let state: TooltipState | null = null
let hideTimer: number | undefined
const listeners = new Set<() => void>()

/* The floating element must be mounted exactly once, whichever instance
   happens to render it — the first registered surface wins, and ownership
   passes down if that instance unmounts. */
let surfaces: number[] = []
let nextId = 0

function notify() {
  listeners.forEach((fn) => fn())
}

function subscribe(fn: () => void) {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

function show(next: TooltipState) {
  window.clearTimeout(hideTimer)
  state = next
  notify()
}

/* Leaving a target starts a short grace period rather than hiding — long
   enough to cross the gap to a neighbouring target, short enough that the
   tooltip doesn't linger once the cursor has truly moved on. */
function hide(source: number, immediate = false) {
  if (state?.source !== source) return
  window.clearTimeout(hideTimer)
  if (immediate) {
    state = null
    notify()
    return
  }
  hideTimer = window.setTimeout(() => {
    state = null
    notify()
  }, 150)
}

function TooltipSurface() {
  const [id] = useState(() => nextId++)

  useEffect(() => {
    surfaces.push(id)
    notify()
    return () => {
      surfaces = surfaces.filter((s) => s !== id)
      notify()
    }
  }, [id])

  const shown = useSyncExternalStore(subscribe, () => (surfaces[0] === id ? state : null))
  if (!shown) return null

  return createPortal(
    /* Position rides on the outer transform so the glide between targets is
       a compositor-only move; the entrance scale lives on the inner element
       where it can't fight the positioning. */
    <span
      role="tooltip"
      className={cn(
        'pointer-events-none fixed top-0 left-0 z-50',
        'motion-safe:transition-transform motion-safe:duration-150 motion-safe:ease-out-strong',
      )}
      style={{ transform: `translate3d(${shown.x}px, ${shown.y}px, 0)` }}
    >
      <span
        className={cn(
          'flex -translate-x-1/2 flex-col items-center',
          'drop-shadow-[0px_4px_3px_rgba(0,0,0,0.1)] filter-[drop-shadow(0px_2px_2px_rgba(0,0,0,0.06))]',
          /* Grows down from the arrow tip — the point pinned to the target.
             Plays on mount only, so a glide never replays it. */
          'origin-top motion-safe:animate-tooltip-in',
        )}
      >
        <svg width="12" height="6" viewBox="0 0 12 6" aria-hidden="true" className="block">
          <path d="M6 0L12 6H0Z" fill="var(--color-stone-800)" />
        </svg>
        <span className="rounded-[6px] bg-stone-800 px-1.5 py-[3px] text-[12px] leading-4 font-normal tracking-[-0.24px] whitespace-nowrap text-white">
          {shown.label}
        </span>
      </span>
    </span>,
    document.body,
  )
}

export function Tooltip({ label, children, className }: {
  label: string
  children: ReactNode
  className?: string
}) {
  const target = useRef<HTMLSpanElement>(null)
  const [id] = useState(() => nextId++)

  /* If this target disappears while its tooltip is up, take the tooltip
     with it — the shared element no longer has an anchor. */
  useEffect(() => () => hide(id, true), [id])

  function handleEnter() {
    /* Immediate — the entrance animation itself is the only delay. */
    const el = target.current
    if (!el) return
    /* Anchor under the nearest button-like ancestor when there is one — the
       wrapper often sits inside a taller pill, and hanging off the wrapper's
       own bottom would overlap the pill's lower edge. */
    const box = el.closest('[role="button"], button') ?? el
    const r = box.getBoundingClientRect()
    const t = el.getBoundingClientRect()
    show({ label, x: t.left + t.width / 2, y: r.bottom + 4, source: id })
  }

  return (
    /* A real box, not `display: contents` — the position is measured off this
       element, and a boxless one measures 0×0 at the viewport origin. */
    <span
      ref={target}
      className={cn('inline-flex shrink-0', className)}
      onMouseEnter={handleEnter}
      onMouseLeave={() => hide(id)}
      /* Pressing the tab is an answer; the tooltip's question is withdrawn. */
      onMouseDown={() => hide(id, true)}
    >
      {children}
      <TooltipSurface />
    </span>
  )
}
