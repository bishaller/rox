import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { cn } from '@/lib/cn'
import { contacts } from '@/data/contacts'
import {
  FILTER_FIELDS, FILTER_OPS, type Filter, type FilterField, type FilterOp,
  matchesFilters, needsValue, newFilter, type SortState,
} from '@/lib/filters'
import { ChevronDownIcon, PlusIcon } from './icons'
import {
  FindCompanyFirmographicsIcon, NewManualColumnsIcon, SelectIcon, UrlIcon,
} from './modalIcons'

/**
 * The dialog behind the tab strip's `+`.
 *
 * It opens seeded with whatever the table is showing, then lets the definition
 * be edited in place: scope selectors, a two-step Add-condition builder
 * (pick a field, then an operator and value), and a live row count.
 *
 * Chrome follows AddColumnModal — same scrim, ring, header band and footer —
 * so the two dialogs read as one family.
 */

/** The field picker's groups, with a type glyph each, as in the design. */
const FIELD_GROUPS: { title: string; fields: { key: FilterField; Icon: typeof UrlIcon }[] }[] = [
  {
    title: 'Contact',
    fields: [
      { key: 'title', Icon: NewManualColumnsIcon },
      { key: 'name', Icon: NewManualColumnsIcon },
      { key: 'email', Icon: NewManualColumnsIcon },
      { key: 'department', Icon: SelectIcon },
      { key: 'linkedinUrl', Icon: UrlIcon },
    ],
  },
  {
    title: 'Company',
    fields: [
      { key: 'companyName', Icon: FindCompanyFirmographicsIcon },
      { key: 'companyDomain', Icon: UrlIcon },
    ],
  },
]

function fieldLabel(key: FilterField) {
  return FILTER_FIELDS.find((f) => f.key === key)?.label ?? key
}

const SELECT =
  'border-button-border bg-card h-[32px] cursor-pointer appearance-none rounded-[8px] ' +
  'border pr-8 pl-3 text-sm outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]'

/** A `label … [select ⌄]` row, as in the design's Sources / Account rows. */
function ScopeRow({ label, value, onChange, options }: {
  label: string
  value: string
  onChange: (v: string) => void
  options: string[]
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-content-primary text-sm">{label}</span>
      <span className="relative inline-flex">
        {/* Fixed width so the Sources and Account selectors rag on one edge. */}
        <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value)}
          className={cn(SELECT, 'w-[150px]')}>
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDownIcon className="text-content-tertiary pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2" />
      </span>
    </div>
  )
}

type Builder =
  | { step: 'field'; q: string }
  | { step: 'edit'; field: FilterField; op: FilterOp; value: string }

export function CreateViewModal({
  open, onClose, onCreate, filters, query, sort,
}: {
  open: boolean
  onClose: () => void
  /** Receives the name and the definition as edited in the dialog. */
  onCreate: (name: string, filters: Filter[]) => void
  filters: Filter[]
  query: string
  sort: SortState | null
}) {
  const titleId = useId()
  const nameRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState('')
  /* The dialog edits its own copy — Cancel must leave the table untouched. */
  const [draft, setDraft] = useState<Filter[]>(filters)
  const [source, setSource] = useState('All')
  const [account, setAccount] = useState('All')
  const [builder, setBuilder] = useState<Builder | null>(null)
  const builderRef = useRef(builder)
  builderRef.current = builder

  /* Reset only when the dialog opens — never on a parent re-render. */
  useEffect(() => {
    if (!open) return
    setName(''); setDraft(filters); setSource('All'); setAccount('All'); setBuilder(null)
    nameRef.current?.focus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      /* Escape peels one layer: the builder first, then the dialog. */
      if (builderRef.current) { e.stopPropagation(); setBuilder(null) }
      else onClose()
    }
    document.addEventListener('keydown', onKey, true)
    /* The page behind must not scroll while the dialog owns the viewport. */
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey, true)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  const accounts = useMemo(
    () => [...new Set(contacts.map((c) => c.companyName).filter(Boolean))] as string[], [])

  if (!open) return null

  /* Account is a filter too — it narrows the count and rides into the view. */
  const effective: Filter[] = account === 'All'
    ? draft
    : [...draft, { ...newFilter(), field: 'companyName' as const, op: 'is' as const, value: account }]

  const q = query.trim().toLowerCase()
  /* The same match the table applies, so the count here is the count there. */
  const count = contacts
    .filter((c) => matchesFilters(c, effective))
    .filter((c) => !q || FILTER_FIELDS.some(({ key }) =>
      String(c[key] ?? '').toLowerCase().includes(q))).length

  const extras = [
    ...(q ? [`Search matches “${query.trim()}”`] : []),
    ...(sort ? [`Sorted by ${fieldLabel(sort.key)} ${sort.dir === 'asc' ? '(A→Z)' : '(Z→A)'}`] : []),
  ]

  function create() {
    const label = name.trim()
    if (!label) return
    onCreate(label, effective)
    onClose()
  }

  function apply() {
    if (builder?.step !== 'edit') return
    if (needsValue(builder.op) && builder.value.trim() === '') return
    setDraft((cur) => [...cur, { ...newFilter(), field: builder.field, op: builder.op, value: builder.value.trim() }])
    setBuilder(null)
  }

  const pickerQ = builder?.step === 'field' ? builder.q.trim().toLowerCase() : ''
  const groups = FIELD_GROUPS
    .map((g) => ({ ...g, fields: g.fields.filter((f) => fieldLabel(f.key).toLowerCase().includes(pickerQ)) }))
    .filter((g) => g.fields.length > 0)

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="motion-safe:animate-menu-in absolute inset-0 bg-os-gray-950/20 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          'bg-card ring-foreground/10 pointer-events-auto fixed top-1/2 left-1/2 w-full max-w-md',
          '-translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl ring-1 outline-none',
          'motion-safe:animate-dialog-in',
        )}
      >
        <form onSubmit={(e) => { e.preventDefault(); create() }}>
          <div className="border-border-secondary grid shrink-0 gap-1.5 border-b px-5 py-4">
            <h2 id={titleId} className="text-base font-medium">Create view</h2>
          </div>

          <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto px-5 py-4">
            <input
              ref={nameRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-label="View name"
              placeholder="Name this view…"
              /* Same focus as the toolbar's search box: the border darkens,
                 nothing glows. */
              className={cn(
                'border-input bg-input-background focus:border-ring h-9 w-full shrink-0',
                'rounded-[8px] border px-3 text-sm outline-none transition-colors',
                'placeholder:text-content-placeholder',
              )}
            />

            {/* Scope — as in the design: label rows with right-hand selectors.
                Sources is cosmetic (the data carries no source field); Account
                genuinely narrows the view. */}
            <div className="grid gap-3">
              <ScopeRow label="Sources" value={source} onChange={setSource}
                options={['All', 'In CRM', 'Not in CRM']} />
              <ScopeRow label="Account" value={account} onChange={setAccount}
                options={['All', ...accounts]} />
            </div>

            <div className="border-border-secondary border-t" />

            {/* Conditions the view captures, each removable. */}
            {(draft.length > 0 || extras.length > 0) && (
              <ul className="grid gap-1.5">
                {draft.map((f) => (
                  <li key={f.id} className="group/cond flex items-center justify-between gap-2">
                    <span className="text-content-secondary min-w-0 truncate text-sm">
                      {fieldLabel(f.field)} {FILTER_OPS.find((x) => x.key === f.op)?.label}
                      {needsValue(f.op) && <> “{f.value}”</>}
                    </span>
                    <button
                      type="button"
                      aria-label={`Remove condition on ${fieldLabel(f.field)}`}
                      onClick={() => setDraft((cur) => cur.filter((x) => x.id !== f.id))}
                      className={cn(
                        'text-content-tertiary hover:text-content-primary hover:bg-os-gray-100',
                        'flex size-5 shrink-0 cursor-pointer items-center justify-center rounded',
                        'opacity-0 transition-opacity outline-none group-hover/cond:opacity-100',
                        'focus-visible:ring-ring/50 focus-visible:opacity-100 focus-visible:ring-[3px]',
                      )}
                    >
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                      </svg>
                    </button>
                  </li>
                ))}
                {extras.map((line) => (
                  <li key={line} className="text-content-secondary text-sm">{line}</li>
                ))}
              </ul>
            )}

            {/* Add condition — expands into the two-step builder in place. */}
            {!builder && (
              <button
                type="button"
                onClick={() => setBuilder({ step: 'field', q: '' })}
                className={cn(
                  'border-button-border bg-card shadow-button self-center',
                  'flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-[10px] border px-3.5',
                  'text-sm font-medium transition-all outline-none',
                  'hover:bg-os-gray-50 active:scale-[0.97]',
                  'focus-visible:ring-ring/50 focus-visible:ring-[3px]',
                )}
              >
                <PlusIcon className="text-content-tertiary size-3.5" />
                Add Condition
              </button>
            )}

            {builder?.step === 'field' && (
              <div className="border-border-tertiary shadow-card motion-safe:animate-menu-pop origin-top overflow-hidden rounded-xl border">
                <div className="border-border-tertiary flex items-center gap-2 border-b px-3 py-2">
                  <input
                    autoFocus
                    type="text"
                    value={builder.q}
                    onChange={(e) => setBuilder({ step: 'field', q: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key !== 'Enter') return
                      e.preventDefault()
                      const first = groups[0]?.fields[0]
                      if (first) setBuilder({ step: 'edit', field: first.key, op: 'contains', value: '' })
                    }}
                    placeholder="Filter by..."
                    aria-label="Filter fields"
                    className="placeholder:text-content-placeholder min-w-0 flex-1 bg-transparent text-sm outline-none"
                  />
                  <button type="button" onClick={() => setBuilder(null)}
                    className="border-border text-content-tertiary hover:text-content-primary cursor-pointer rounded-md border px-1.5 py-0.5 text-[11px]">
                    esc
                  </button>
                </div>
                <div className="max-h-56 overflow-y-auto p-1.5">
                  {groups.map((g) => (
                    <div key={g.title}>
                      <div className="text-content-quaternary px-2 pt-2 pb-1 text-[11px] font-medium tracking-wide uppercase">
                        {g.title}
                      </div>
                      {g.fields.map(({ key, Icon }) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setBuilder({ step: 'edit', field: key, op: 'contains', value: '' })}
                          className={cn(
                            'hover:bg-os-gray-75 flex h-9 w-full cursor-pointer items-center gap-2.5',
                            'rounded-lg px-2 text-left text-sm outline-none',
                            'focus-visible:bg-os-gray-75',
                          )}
                        >
                          <Icon className="text-content-tertiary size-4 shrink-0" />
                          <span className="min-w-0 flex-1 truncate">{fieldLabel(key)}</span>
                          <ChevronDownIcon className="text-content-quaternary size-3.5 shrink-0 -rotate-90" />
                        </button>
                      ))}
                    </div>
                  ))}
                  {groups.length === 0 && (
                    <div className="text-content-tertiary px-2 py-3 text-sm">No matching fields.</div>
                  )}
                </div>
              </div>
            )}

            {builder?.step === 'edit' && (
              <div className="border-border-tertiary shadow-card motion-safe:animate-menu-pop origin-top overflow-hidden rounded-xl border">
                <div className="border-border-tertiary flex items-center gap-1.5 border-b px-3 py-2">
                  <span className="text-content-tertiary text-sm">{fieldLabel(builder.field)}</span>
                  <span className="relative inline-flex min-w-0">
                    <select
                      aria-label="Operator"
                      value={builder.op}
                      onChange={(e) => setBuilder({ ...builder, op: e.target.value as FilterOp })}
                      className="cursor-pointer appearance-none bg-transparent pr-6 text-sm font-medium outline-none"
                    >
                      {FILTER_OPS.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
                    </select>
                    <ChevronDownIcon className="text-content-tertiary pointer-events-none absolute top-1/2 right-1 size-3.5 -translate-y-1/2" />
                  </span>
                </div>
                {needsValue(builder.op) && (
                  <input
                    autoFocus
                    type="text"
                    value={builder.value}
                    onChange={(e) => setBuilder({ ...builder, value: e.target.value })}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); apply() } }}
                    placeholder="Enter value..."
                    aria-label="Condition value"
                    className="placeholder:text-content-placeholder w-full border-0 bg-transparent px-3 py-2.5 text-sm outline-none"
                  />
                )}
                <div className="flex justify-end px-3 pt-1 pb-2.5">
                  <button
                    type="button"
                    onClick={apply}
                    disabled={needsValue(builder.op) && builder.value.trim() === ''}
                    className={cn(
                      'bg-secondary text-secondary-foreground inline-flex h-8 shrink-0 cursor-pointer',
                      'items-center rounded-lg px-3 text-sm font-medium transition-all outline-none',
                      'not-disabled:hover:bg-secondary-hover not-disabled:active:scale-[0.97]',
                      'focus-visible:ring-ring/50 focus-visible:ring-[3px]',
                      'disabled:cursor-not-allowed disabled:opacity-50',
                    )}
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}

            {/* Live count, centred under the builder as in the design. */}
            <div className="text-content-secondary text-center text-sm tabular-nums">
              {count.toLocaleString()} {count === 1 ? 'contact' : 'contacts'}
            </div>

            <div className="border-border-secondary flex shrink-0 items-center justify-between border-t pt-4">
              <span className="text-content-secondary text-sm">Visible to</span>
              <span className="relative inline-flex">
                <select aria-label="Visible to" defaultValue="me" className={SELECT}>
                  <option value="me">Only me</option>
                  <option value="team">Everyone at Rox</option>
                </select>
                <ChevronDownIcon className="text-content-tertiary pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2" />
              </span>
            </div>
          </div>

          <div className="border-border-secondary bg-os-gray-50 flex items-center justify-end gap-2 border-t px-5 py-3">
            <button
              type="button"
              onClick={onClose}
              className={cn(
                'text-content-secondary hover:bg-overlay-secondary inline-flex h-[36px] shrink-0',
                'cursor-pointer items-center rounded-[8px] px-2.5 text-sm font-medium',
                'transition-all outline-none active:scale-[0.97]',
                'focus-visible:ring-ring/50 focus-visible:ring-[3px]',
              )}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={name.trim() === ''}
              className={cn(
                'bg-button text-foreground border-button-border shadow-button inline-flex h-[36px]',
                'shrink-0 cursor-pointer items-center justify-center rounded-[8px] border px-2.5',
                'text-sm font-medium whitespace-nowrap transition-all outline-none',
                'not-disabled:hover:bg-button-hover not-disabled:active:scale-[0.97]',
                'focus-visible:ring-ring/50 focus-visible:ring-[3px]',
                'disabled:cursor-not-allowed disabled:opacity-50',
              )}
            >
              Create view
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
