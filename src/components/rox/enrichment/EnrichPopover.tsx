import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/cn'
import { type Anchor, useAnchoredOverlay } from '../overlay'
import {
  AddCleverColumnIcon, AddFormulaColumnIcon, FindPersonDetailsIcon, FindPhoneNumbersIcon,
  FindWorkEmailIcon, NewManualColumnsIcon, NumberIcon, ValidateEmailIcon, ValidatePhoneIcon,
} from '../modalIcons'
import {
  CREATE_ITEMS, ENRICHMENTS, EXISTING_FIELDS, type EnrichmentId, existingKey,
} from '@/data/enrichments'

export const ENRICH_POPOVER_WIDTH = 372

/* Reverse lookup shares the person glyph, exactly as the Add-column dialog
   already does for its own list. */
const ENRICH_ICONS: Record<EnrichmentId, typeof FindWorkEmailIcon> = {
  work_email: FindWorkEmailIcon,
  phone: FindPhoneNumbersIcon,
  person_details: FindPersonDetailsIcon,
  reverse_email: FindPersonDetailsIcon,
  validate_email: ValidateEmailIcon,
  validate_phone: ValidatePhoneIcon,
}

const CREATE_ICONS: Record<(typeof CREATE_ITEMS)[number], typeof FindWorkEmailIcon> = {
  'Text column': NewManualColumnsIcon,
  'Number column': NumberIcon,
  Formula: AddFormulaColumnIcon,
  'Clever column': AddCleverColumnIcon,
}

const ITEM =
  'focus-visible:ring-ring/50 hover:bg-os-gray-75 flex w-full cursor-pointer items-center ' +
  'gap-2 rounded-lg px-2.5 py-[7px] text-left text-[13.5px] outline-none focus-visible:ring-[3px]'

const GROUP =
  'text-content-tertiary px-2.5 pt-2 pb-1 text-[11px] font-medium tracking-wide uppercase'

/** First case-insensitive match wrapped in a mark, as the reference does. */
export function highlight(label: string, q: string): ReactNode {
  if (!q) return label
  const i = label.toLowerCase().indexOf(q.toLowerCase())
  if (i < 0) return label
  return (
    <>
      {label.slice(0, i)}
      <mark className="rounded-[2px] bg-amber-100 text-inherit">{label.slice(i, i + q.length)}</mark>
      {label.slice(i + q.length)}
    </>
  )
}

/** Lifted from the Add-column dialog, where Formula and Clever carry it. */
function AiBadge() {
  return (
    <span className="bg-tertiary text-tertiary-foreground border-border inline-flex h-4 shrink-0 items-center rounded-full border px-1 text-[10px] font-medium">
      AI
    </span>
  )
}

/**
 * The "+" popover: everything that could land in a new column. Enrichments
 * and Create up front; the long list of fields the user already has stays a
 * search away (typed matches, or the Fields dialog via the footer row).
 */
export function EnrichPopover({
  anchor, onClose, onPickEnrichment, onPickCreate, onPickClever,
  onToggleExisting, onOpenFields, shownExisting,
}: {
  anchor: Anchor
  onClose: () => void
  onPickEnrichment: (id: EnrichmentId) => void
  onPickCreate: (label: string) => void
  onPickClever: (query: string) => void
  onToggleExisting: (key: string) => void
  onOpenFields: (prefillQuery?: string) => void
  shownExisting: Set<string>
}) {
  const { ref, pos } = useAnchoredOverlay({ anchor, onClose })
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const q = query.trim().toLowerCase()
  const typed = q.length > 0

  const enrichMatches = typed
    ? ENRICHMENTS.filter((e) => e.name.toLowerCase().includes(q))
    : ENRICHMENTS
  const createMatches = typed
    ? CREATE_ITEMS.filter((c) => c.toLowerCase().includes(q))
    : [...CREATE_ITEMS]
  const existingMatches = typed
    ? EXISTING_FIELDS.filter((f) => f.name.toLowerCase().includes(q) || f.object.toLowerCase() === q)
    : []
  const hiddenCount = EXISTING_FIELDS.filter((f) => !shownExisting.has(existingKey(f))).length
  const nothingMatched = typed && enrichMatches.length + createMatches.length + existingMatches.length === 0

  /** Enter commits the first real result, as in the reference. */
  function pickFirst() {
    ref.current?.querySelector<HTMLButtonElement>('[data-pick]')?.click()
  }

  const enrichRows = enrichMatches.map((e) => {
    const Icon = ENRICH_ICONS[e.id]
    return (
      <button key={e.id} type="button" data-pick className={ITEM}
        onClick={() => onPickEnrichment(e.id)}>
        <Icon className="text-content-tertiary size-4 shrink-0" />
        <span className="shrink-0">{highlight(e.name, q)}</span>
        <span className="text-content-tertiary ml-auto min-w-0 truncate pl-2 text-[11px]">
          {e.providers.join(' → ')}
        </span>
      </button>
    )
  })

  const createRows = createMatches.map((label) => {
    const Icon = CREATE_ICONS[label]
    const ai = label === 'Formula' || label === 'Clever column'
    return (
      <button key={label} type="button" data-pick className={ITEM}
        onClick={() => (label === 'Clever column' ? onPickClever('') : onPickCreate(label))}>
        <Icon className="text-content-tertiary size-4 shrink-0" />
        <span className="shrink-0">{highlight(label, q)}</span>
        {ai && <AiBadge />}
      </button>
    )
  })

  const existingRows = existingMatches.slice(0, 9).map((f) => {
    const key = existingKey(f)
    const shown = shownExisting.has(key)
    return (
      <button key={key} type="button" data-pick className={ITEM}
        onClick={() => onToggleExisting(key)}>
        <span className="min-w-0 truncate">{highlight(f.name, q)}</span>
        <span className="border-line text-content-tertiary shrink-0 rounded-[5px] border px-1.5 text-[10.5px]">
          {f.object}
        </span>
        <span className="ml-auto flex shrink-0 items-center gap-2 pl-2 text-[11px]">
          {f.source && <span className="text-content-tertiary">{f.source}</span>}
          {shown && <span className="text-accent-green-primary">shown</span>}
        </span>
      </button>
    )
  })

  const cleverRow = (
    <button type="button" className={cn(ITEM, 'text-amber-700 hover:bg-amber-50')}
      onClick={() => onPickClever(query.trim())}>
      <AddCleverColumnIcon className="size-4 shrink-0 text-amber-500" />
      <span className="min-w-0 truncate">Clever column for “{query.trim()}”</span>
      <span className="text-content-tertiary ml-auto shrink-0 pl-2 text-[11px]">AI-filled</span>
    </button>
  )

  return createPortal(
    <div
      ref={ref}
      role="dialog"
      aria-label="Add column"
      style={{ left: pos.x, top: pos.y, width: ENRICH_POPOVER_WIDTH }}
      className={cn(
        'border-border-tertiary bg-card shadow-card fixed z-50 overflow-y-auto rounded-xl border p-1.5',
        'max-h-[min(70vh,520px)]',
        'origin-top-right motion-safe:animate-menu-pop motion-reduce:animate-menu-in',
      )}
    >
      {/* Sticky, so the search survives scrolling the list under it. */}
      <div className="bg-card sticky top-0 z-10 -m-1.5 mb-0 p-1.5">
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              pickFirst()
            }
          }}
          placeholder="Search or describe what you need…"
          className="border-button-border bg-card focus-visible:border-ring h-[32px] w-full rounded-lg border px-2.5 text-[13px] outline-none"
        />
      </div>

      {!typed ? (
        <>
          <div className={GROUP}>Enrich</div>
          {enrichRows}
          <div className={GROUP}>Create</div>
          {createRows}
          <div className="bg-line mx-1 my-1 h-px" />
          <button type="button" className={cn(ITEM, 'text-content-secondary text-[13px]')}
            onClick={() => onOpenFields()}>
            <NewManualColumnsIcon className="text-content-tertiary size-4 shrink-0 rotate-90" />
            Show a field you already have
            <span className="text-content-tertiary ml-auto shrink-0 pl-2 text-[11px]">
              {hiddenCount} hidden
            </span>
          </button>
        </>
      ) : nothingMatched ? (
        <>
          {/* Sentence case, unlike the group labels — this is a message, not
             a heading over a list. */}
          <div className="text-content-tertiary px-2.5 pt-2 pb-1 text-[12px]">
            No existing columns match.
          </div>
          <div className="px-2.5 pt-1 pb-1.5">
            <button
              type="button"
              data-pick
              onClick={() => onPickClever(query.trim())}
              className="border-border-secondary bg-card hover:bg-amber-50 focus-visible:ring-ring/50 flex h-8 max-w-full cursor-pointer items-center gap-1.5 rounded-lg border py-0 pr-3 pl-1 outline-none focus-visible:ring-[3px]"
            >
              <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-amber-50 ring-1 ring-amber-200/70">
                <AddCleverColumnIcon className="size-3.5 text-amber-500" />
              </span>
              <span className="text-content-primary min-w-0 truncate text-xs font-medium">
                Create clever column for “{query.trim()}”
              </span>
            </button>
          </div>
          <p className="text-content-tertiary px-2.5 pt-0.5 pb-3 text-[12.5px] leading-relaxed">
            AI fills in this column for every row.
          </p>
        </>
      ) : (
        <>
          {enrichMatches.length + createMatches.length > 0 && (
            <>
              <div className={GROUP}>Create new</div>
              {enrichRows}
              {createRows}
            </>
          )}
          {existingMatches.length > 0 && (
            <>
              <div className={GROUP}>Already in your data · free to show</div>
              {existingRows}
              {existingMatches.length > 9 && (
                <button type="button" className={cn(ITEM, 'text-content-secondary text-[13px]')}
                  onClick={() => onOpenFields(query.trim())}>
                  {existingMatches.length - 9} more matches
                  <span className="text-content-tertiary ml-auto shrink-0 pl-2 text-[11px]">
                    Open field list
                  </span>
                </button>
              )}
            </>
          )}
          {enrichMatches.length === 0 && (
            <>
              <div className="bg-line mx-1 my-1 h-px" />
              {cleverRow}
            </>
          )}
        </>
      )}
    </div>,
    document.body,
  )
}
