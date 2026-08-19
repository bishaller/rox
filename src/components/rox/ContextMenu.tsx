import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/cn'
import { type Anchor, useAnchoredOverlay } from './overlay'

export type MenuItem = {
  label: string
  onSelect: () => void
  /** `destructive` paints the item red, as Delete is in the design. */
  tone?: 'default' | 'destructive'
  disabled?: boolean
}

export type MenuAnchor = Anchor

/**
 * A small overlay menu anchored to a point — the target of a right-click, or
 * the bottom-left of the control that opened it.
 *
 * Portalled to `document.body` rather than rendered in place: the view-tab
 * strip is `overflow-hidden` so it can fade its own overflow, and a menu
 * rendered inside it would be clipped by that.
 */
export function ContextMenu({
  anchor, items, onClose,
}: {
  anchor: MenuAnchor
  items: MenuItem[]
  onClose: () => void
}) {
  /* Menus follow their trigger, so this one goes on scroll. */
  const { ref, pos } = useAnchoredOverlay({ anchor, onClose, closeOnScroll: true })

  /* Focus the first item once the overlay has been placed. */
  useEffect(() => {
    ref.current?.querySelector<HTMLButtonElement>('[role="menuitem"]:not([disabled])')?.focus()
  }, [ref, anchor])

  useEffect(() => {
    /* Escape and outside-press are handled by the overlay hook; this is only
       roving focus between the items. */
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
      e.preventDefault()
      const all = [...(ref.current?.querySelectorAll<HTMLButtonElement>(
        '[role="menuitem"]:not([disabled])') ?? [])]
      if (all.length === 0) return
      const at = all.indexOf(document.activeElement as HTMLButtonElement)
      const step = e.key === 'ArrowDown' ? 1 : -1
      all[(at + step + all.length) % all.length].focus()
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [ref])

  return createPortal(
    <div
      ref={ref}
      role="menu"
      className={cn(
        'border-border-tertiary bg-card shadow-card fixed z-50 min-w-[192px]',
        'overflow-hidden rounded-xl border py-0',
        /* Grows from its top-left — the corner pinned to the click point — so
           it reads as coming from the cursor. Safe with the edge correction:
           the overlay hook measures offset sizes, which ignore the transform.
           Reduced motion keeps the plain fade instead of appearing cold. */
        'origin-top-left motion-safe:animate-menu-pop motion-reduce:animate-menu-in',
      )}
      style={{ left: pos.x, top: pos.y }}
    >
      {items.map((item, i) => (
        <button
          key={`${i}:${item.label}`}
          type="button"
          role="menuitem"
          disabled={item.disabled}
          onClick={() => { item.onSelect(); onClose() }}
          className={cn(
            'flex h-10 w-full cursor-pointer items-center px-4 text-left text-[15px]',
            'outline-none transition-colors',
            'hover:bg-os-gray-100 focus-visible:bg-os-gray-100',
            'disabled:text-content-disabled disabled:cursor-default disabled:hover:bg-transparent',
            item.tone === 'destructive' ? 'text-destructive' : 'text-content-primary',
          )}
        >
          {item.label}
        </button>
      ))}
    </div>,
    document.body,
  )
}
