import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'
import { CheckIcon } from '../icons'
import { EXISTING_FIELDS, existingKey } from '@/data/enrichments'
import { DialogShell, DIALOG_BTN_PRIMARY } from './DialogShell'
import { highlight } from './EnrichPopover'

/**
 * The long list of fields the user already has — where a long list belongs.
 * Toggling is free and instant; the data is already synced, nothing fetches.
 */
export function FieldsModal({
  initialQuery = '', shown, onToggle, onClose,
}: {
  initialQuery?: string
  shown: Set<string>
  onToggle: (key: string) => void
  onClose: () => void
}) {
  const [query, setQuery] = useState(initialQuery)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.setSelectionRange(initialQuery.length, initialQuery.length)
  }, [initialQuery])

  const q = query.trim().toLowerCase()
  const list = q ? EXISTING_FIELDS.filter((f) => f.name.toLowerCase().includes(q)) : EXISTING_FIELDS

  return (
    <DialogShell
      title="Fields"
      subtitle={`${shown.size} of ${EXISTING_FIELDS.length} shown in this view`}
      onClose={onClose}
      footer={
        <>
          <span className="text-content-tertiary mr-auto min-w-0 truncate text-[12px]">
            Reorder columns by dragging them in the table.
          </span>
          <button type="button" className={DIALOG_BTN_PRIMARY} onClick={onClose}>
            Done
          </button>
        </>
      }
    >
      <div className="py-4">
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter fields…"
          className="border-button-border bg-card focus-visible:border-ring mb-3 h-[32px] w-full rounded-lg border px-2.5 text-[13px] outline-none"
        />
        <div className="border-line overflow-hidden rounded-[10px] border">
          {list.length === 0 && (
            <p className="text-content-tertiary px-4 py-5 text-[12.5px]">
              No field matches “{query.trim()}”.
            </p>
          )}
          {list.map((f) => {
            const key = existingKey(f)
            const on = shown.has(key)
            return (
              <button
                key={key}
                type="button"
                onClick={() => onToggle(key)}
                className="border-line hover:bg-os-gray-50 focus-visible:ring-ring/50 flex w-full cursor-pointer items-center gap-3 border-b px-3 py-2 text-left outline-none focus-visible:ring-inset focus-visible:ring-[3px] last:border-b-0"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'flex size-4 shrink-0 items-center justify-center rounded-[4.5px] border-[1.5px]',
                    on ? 'border-accent-ai bg-accent-ai text-white' : 'border-line-strong',
                  )}
                >
                  {on && <CheckIcon className="size-2.5 motion-safe:animate-check-in" />}
                </span>
                <span className="min-w-0 flex-1 truncate text-[13px]">{highlight(f.name, q)}</span>
                <span className="border-line text-content-tertiary shrink-0 rounded-[5px] border px-1.5 text-[10.5px]">
                  {f.object}
                </span>
                {f.source && (
                  <span className="text-content-tertiary shrink-0 text-[11.5px]">{f.source}</span>
                )}
              </button>
            )
          })}
        </div>
        <p className="text-content-tertiary mt-2.5 text-[12px]">
          Showing a field is free and instant — the data is already synced.
        </p>
      </div>
    </DialogShell>
  )
}
