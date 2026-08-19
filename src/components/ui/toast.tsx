import { useEffect, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'

/**
 * Bottom-centre message pill. One message at a time — a new toast replaces
 * the current one and restarts the clock, so rapid actions never queue a
 * backlog of stale confirmations.
 *
 * Module-level singleton, same construction as the tooltip: any code calls
 * `toast()`, and whichever mounted <ToastSurface> registered first renders
 * the pill. Entrance only, no exit — the codebase convention.
 */

type ToastState = { message: string; key: number }

let state: ToastState | null = null
let hideTimer: number | undefined
let nextKey = 0
const listeners = new Set<() => void>()

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

export function toast(message: string) {
  window.clearTimeout(hideTimer)
  /* The key bumps on every call so replacing a visible toast remounts the
     pill and replays its entrance — otherwise the text would just swap. */
  state = { message, key: nextKey++ }
  notify()
  hideTimer = window.setTimeout(() => {
    state = null
    notify()
  }, 2600)
}

export function ToastSurface() {
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
    <div
      key={shown.key}
      role="status"
      aria-live="polite"
      className="shadow-card pointer-events-none fixed bottom-6 left-1/2 z-[70] -translate-x-1/2 rounded-[10px] bg-stone-800 px-4 py-2.5 text-[13px] whitespace-nowrap text-white motion-safe:animate-toast-in"
    >
      {shown.message}
    </div>,
    document.body,
  )
}
