import { useEffect, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/cn'
import {
  FILTER_FIELDS, FILTER_OPS, type Filter, type FilterField, type FilterOp,
  needsValue, newFilter,
} from '@/lib/filters'
import { type Anchor, useAnchoredOverlay } from './overlay'
import { ChevronDownIcon, PlusIcon } from './icons'

const FIELD = 'border-button-border bg-card h-[32px] rounded-lg border text-[14px]'

/**
 * A `<select>` under the surface — the chevron is ours, the menu is the
 * platform's. Rolling our own listbox would cost the keyboard behaviour and
 * screen-reader support that comes free here, for no visual gain.
 */
function Select<T extends string>({
  value, onChange, options, width, label,
}: {
  value: T
  onChange: (v: T) => void
  options: readonly { key: T; label: string }[]
  width: string
  label: string
}) {
  return (
    <span className="relative shrink-0" style={{ width }}>
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className={cn(
          FIELD, 'text-content-primary w-full cursor-pointer appearance-none pr-8 pl-3',
          'outline-none focus-visible:border-ring',
        )}
      >
        {options.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
      </select>
      <ChevronDownIcon
        className="text-content-tertiary pointer-events-none absolute top-1/2 right-3 -translate-y-1/2"
      />
    </span>
  )
}

function RemoveIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function FilterPanel({
  anchor, filters, onChange, onClose, trigger,
}: {
  anchor: Anchor
  filters: Filter[]
  onChange: (next: Filter[]) => void
  onClose: () => void
  trigger?: RefObject<HTMLElement | null>
}) {
  /* Stays put while the table scrolls beneath it — the user is mid-edit. */
  const { ref, pos } = useAnchoredOverlay({ anchor, onClose, trigger })

  /* The panel is portalled to the end of the body, so Tab from the trigger
     would walk past it into the rest of the toolbar. Move focus in on open. */
  useEffect(() => {
    ref.current?.querySelector<HTMLElement>('select, input, button')?.focus()
  }, [ref, anchor])

  const patch = (id: string, part: Partial<Filter>) =>
    onChange(filters.map((f) => (f.id === id ? { ...f, ...part } : f)))

  /* Never drop to zero rows: an empty panel offers nothing to act on, and the
     design always shows a row. An empty row does not filter anything. */
  const remove = (id: string) => {
    const next = filters.filter((f) => f.id !== id)
    onChange(next.length ? next : [newFilter()])
  }

  return createPortal(
    <div
      ref={ref}
      role="dialog"
      aria-label="Filters"
      className={cn(
        'border-border-tertiary bg-card shadow-card fixed z-50 w-[560px]',
        'overflow-hidden rounded-xl border motion-safe:animate-menu-in',
      )}
      style={{ left: pos.x, top: pos.y }}
    >
      <div className="flex flex-col gap-2 p-4">
        {filters.map((f, i) => (
          <div key={f.id} className="flex items-center gap-2">
            {/* Fixed width so the two selects line up down the stack rather
                than stepping in by the difference between "Where" and "and". */}
            <span className="text-content-tertiary w-12 shrink-0 text-[14px]">
              {i === 0 ? 'Where' : 'and'}
            </span>

            <Select
              label={`Column, filter ${i + 1}`} width="150px" value={f.field}
              options={FILTER_FIELDS as readonly { key: FilterField; label: string }[]}
              onChange={(v) => patch(f.id, { field: v })}
            />
            <Select
              label={`Condition, filter ${i + 1}`} width="130px" value={f.op}
              options={FILTER_OPS as readonly { key: FilterOp; label: string }[]}
              onChange={(v) => patch(f.id, { op: v })}
            />

            <input
              type="text"
              aria-label={`Value, filter ${i + 1}`}
              placeholder="Enter value..."
              value={f.value}
              disabled={!needsValue(f.op)}
              onChange={(e) => patch(f.id, { value: e.target.value })}
              className={cn(
                FIELD, 'text-content-primary placeholder:text-content-placeholder min-w-0 flex-1 px-3',
                'outline-none focus-visible:border-ring',
                'disabled:bg-os-gray-50 disabled:placeholder:text-content-disabled',
              )}
            />

            <button
              type="button"
              onClick={() => remove(f.id)}
              aria-label={`Remove filter ${i + 1}`}
              className={cn(
                'text-content-tertiary hover:text-content-primary hover:bg-os-gray-100',
                'focus-visible:ring-ring/50 flex size-[28px] shrink-0 cursor-pointer',
                'items-center justify-center rounded-md outline-none',
                'transition-colors focus-visible:ring-[3px]',
              )}
            >
              <RemoveIcon />
            </button>
          </div>
        ))}
      </div>

      {/* Tinted and ruled off, so the actions read as the panel's chrome rather
          than as another filter row. */}
      <div className="border-border-tertiary bg-os-gray-50 flex items-center justify-between border-t px-4 py-2.5">
        <button
          type="button"
          onClick={() => onChange([newFilter()])}
          className={cn(
            'text-content-tertiary hover:text-content-primary focus-visible:ring-ring/50',
            'h-[30px] cursor-pointer rounded-md px-2 text-[14px] outline-none',
            'transition-colors focus-visible:ring-[3px]',
          )}
        >
          Clear all
        </button>

        <button
          type="button"
          onClick={() => onChange([...filters, newFilter()])}
          className={cn(
            'border-button-border text-content-primary bg-card shadow-button',
            'hover:bg-os-gray-50 focus-visible:ring-ring/50 flex h-[30px] cursor-pointer',
            'items-center gap-1.5 rounded-lg border px-3 text-[14px] outline-none',
            'transition-colors focus-visible:ring-[3px]',
          )}
        >
          <PlusIcon className="text-content-secondary" />
          New filter
        </button>
      </div>
    </div>,
    document.body,
  )
}
