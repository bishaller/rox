import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/cn'
import { contacts } from '@/data/contacts'
import {
  FILTER_FIELDS, FILTER_OPS, type Filter, type FilterField, type FilterJoin, type FilterOp,
  needsValue, newFilter,
} from '@/lib/filters'
import { type Anchor, useAnchoredOverlay } from './overlay'
import { CheckIcon, ChevronDownIcon, PlusIcon, SearchIcon } from './icons'
import {
  ContactColumnsIcon, FindCompanyDomainIcon, FindCompanyFirmographicsIcon,
  FindPersonDetailsIcon, FindWorkEmailIcon, SelectIcon, UrlIcon,
} from './modalIcons'

/* ────────────────────────────────────────────────────────────────────────────
 * Consolidated filter, after the reference structure:
 *   • Source / Accounts are pinned single-select rows above the divider —
 *     always present, can't be removed. (Cosmetic here: contacts carry no
 *     source/account data.)
 *   • Conditions are tokens, not form rows — a filter doesn't exist until it
 *     has a value, so nothing is counted before it filters.
 *   • Add condition opens a field picker; the operator lives in the value
 *     step, defaulting to contains / is, one click away.
 *   • and / or is switchable from the second condition onward.
 * ──────────────────────────────────────────────────────────────────────────── */

const FIELD_GROUPS: { label: string; keys: FilterField[] }[] = [
  { label: 'Contact', keys: ['name', 'title', 'email', 'department'] },
  { label: 'Company', keys: ['companyName', 'companyDomain', 'linkedinUrl'] },
]

const FIELD_ICONS: Record<FilterField, typeof SearchIcon> = {
  name: FindPersonDetailsIcon,
  title: ContactColumnsIcon,
  email: FindWorkEmailIcon,
  department: SelectIcon,
  companyName: FindCompanyFirmographicsIcon,
  companyDomain: FindCompanyDomainIcon,
  linkedinUrl: UrlIcon,
}

/* Operators grouped match / equality / presence, as the reference lays the
   picker out. Keys are the model's own — no new operator semantics. */
const OP_GROUPS: FilterOp[][] = [
  ['contains', 'notContains'],
  ['is', 'isNot'],
  ['isEmpty', 'isNotEmpty'],
]

const fieldLabel = (key: FilterField) => FILTER_FIELDS.find((f) => f.key === key)!.label
const opLabel = (key: FilterOp) => FILTER_OPS.find((o) => o.key === key)!.label

/** The one enum-ish field: its values (with live counts) become a pick list. */
const DEPT_OPTIONS: [string, number][] = (() => {
  const counts = new Map<string, number>()
  contacts.forEach((c) => {
    if (c.department) counts.set(c.department, (counts.get(c.department) ?? 0) + 1)
  })
  return [...counts.entries()].sort((a, b) => b[1] - a[1])
})()

/* Pinned rows. Counts are real where the data can supply them. */
const SOURCE_OPTIONS: [string, number][] = [
  ['All sources', contacts.length],
  ['In CRM', contacts.filter((c) => c.email).length],
  ['Not in CRM', contacts.filter((c) => !c.email).length],
]
const ACCOUNT_OPTIONS: [string, number][] = (() => {
  const counts = new Map<string, number>()
  contacts.forEach((c) => {
    if (c.companyName) counts.set(c.companyName, (counts.get(c.companyName) ?? 0) + 1)
  })
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4)
  return [['All accounts', contacts.length], ...top]
})()

const ROW = 'flex w-full cursor-pointer items-center rounded-[7px] text-left outline-none'
const HOVER = 'hover:bg-os-gray-75'
const GROUP_LABEL =
  'text-content-tertiary px-2 pt-2 pb-1 text-[10.5px] font-semibold tracking-[0.05em] uppercase'

/** Which sub-popover is open, and where. Rendered inside the panel's own DOM
    node so the outer overlay's outside-press dismiss leaves it alone. */
type Sub =
  | { kind: 'pin'; pin: 'source' | 'account'; at: Anchor }
  | { kind: 'fields'; at: Anchor }
  | {
      kind: 'vals'
      at: Anchor
      field: FilterField
      op: FilterOp
      /** Set when a token is being edited rather than a condition added. */
      editingId: string | null
      draft: string
      showOps: boolean
    }

/** Anchor a sub under a row, viewport-clamped for its width. */
function subAnchor(el: HTMLElement, width: number): Anchor {
  const r = el.getBoundingClientRect()
  return {
    x: Math.max(8, Math.min(r.left, window.innerWidth - width - 8)),
    y: r.bottom + 4,
  }
}

export function FilterPanel({
  anchor, filters, onChange, join, onJoinChange, onClose, trigger, resultCount,
}: {
  anchor: Anchor
  filters: Filter[]
  onChange: (next: Filter[]) => void
  join: FilterJoin
  onJoinChange: (next: FilterJoin) => void
  onClose: () => void
  trigger?: RefObject<HTMLElement | null>
  /** Rows the current conditions leave visible — the footer's live count. */
  resultCount: number
}) {
  const [sub, setSub] = useState<Sub | null>(null)
  const [pins, setPins] = useState({ source: 0, account: 0 })

  /* Escape and outside presses peel the sub-popover first, the panel second —
     read through a ref so the overlay hook's listeners stay stable. */
  const subRef = useRef(sub)
  subRef.current = sub
  const handleClose = useCallback(() => {
    if (subRef.current) setSub(null)
    else onClose()
  }, [onClose])

  /* Stays put while the table scrolls beneath it — the user is mid-edit. */
  const { ref, pos } = useAnchoredOverlay({ anchor, onClose: handleClose, trigger })

  const anyActive = filters.length > 0 || pins.source !== 0 || pins.account !== 0

  function remove(id: string) {
    onChange(filters.filter((f) => f.id !== id))
  }

  function clearAll() {
    onChange([])
    setPins({ source: 0, account: 0 })
    onJoinChange('and')
    setSub(null)
  }

  function commit(field: FilterField, op: FilterOp, value: string) {
    const editingId = sub?.kind === 'vals' ? sub.editingId : null
    if (editingId) {
      onChange(filters.map((f) => (f.id === editingId ? { ...f, field, op, value } : f)))
    } else {
      onChange([...filters, { ...newFilter(), field, op, value }])
    }
    setSub(null)
  }

  const pinOptions = sub?.kind === 'pin'
    ? (sub.pin === 'source' ? SOURCE_OPTIONS : ACCOUNT_OPTIONS)
    : []

  return createPortal(
    <div
      ref={ref}
      role="dialog"
      aria-label="Filters"
      className={cn(
        'border-border-tertiary bg-card shadow-card fixed z-50 w-[340px]',
        'rounded-xl border p-1.5 motion-safe:animate-menu-in',
      )}
      style={{ left: pos.x, top: pos.y }}
    >
      {/* Pinned rows — always present, single-select, can't be removed. The
          trigger is a bordered pill so the selector reads as a selector. */}
      {(['source', 'account'] as const).map((pin) => {
        const options = pin === 'source' ? SOURCE_OPTIONS : ACCOUNT_OPTIONS
        const isDefault = pins[pin] === 0
        const value = isDefault ? 'All' : options[pins[pin]][0]
        return (
          <div key={pin} className="flex h-[40px] items-center justify-between gap-3 px-2">
            <span className="text-content-primary text-[13px] font-medium">
              {pin === 'source' ? 'Sources' : 'Accounts'}
            </span>
            <button
              type="button"
              aria-haspopup="listbox"
              aria-label={`${pin === 'source' ? 'Sources' : 'Accounts'}: ${value}`}
              onClick={(e) => setSub({ kind: 'pin', pin, at: subAnchor(e.currentTarget, 250) })}
              className={cn(
                'border-button-border bg-card hover:bg-os-gray-50 flex h-[30px] min-w-0',
                'cursor-pointer items-center gap-2 rounded-lg border px-3 text-[13px]',
                'focus-visible:border-ring outline-none',
                isDefault ? 'text-content-primary' : 'text-content-primary font-medium',
              )}
            >
              <span className="max-w-[140px] min-w-0 truncate">{value}</span>
              <ChevronDownIcon className="text-content-tertiary size-3 shrink-0" />
            </button>
          </div>
        )
      })}

      <div className="bg-line my-1 h-px" aria-hidden="true" />

      {/* Condition tokens. Click to edit; ✕ appears on hover. */}
      {filters.map((f, i) => (
        <div
          key={f.id}
          className={cn(ROW, HOVER, 'group/tok min-h-[34px] gap-2 py-1 pr-1.5 pl-2')}
          onClick={(e) =>
            setSub({
              kind: 'vals',
              at: subAnchor(e.currentTarget, 250),
              field: f.field,
              op: f.op,
              editingId: f.id,
              draft: f.value,
              showOps: false,
            })}
        >
          <span className="text-content-tertiary w-[34px] shrink-0 text-[11.5px] lowercase">
            {i === 0 ? 'where' : (
              <button
                type="button"
                aria-label={`Combine conditions with ${join === 'and' ? 'or' : 'and'} instead`}
                onClick={(e) => {
                  e.stopPropagation()
                  onJoinChange(join === 'and' ? 'or' : 'and')
                }}
                className="hover:text-content-primary -mx-1 cursor-pointer rounded px-1 py-0.5 hover:bg-stone-200/60"
              >
                {join}
              </button>
            )}
          </span>
          <span className="text-content-secondary min-w-0 flex-1 truncate text-[13px]">
            <b className="text-content-primary font-medium">{fieldLabel(f.field)}</b>
            {' '}{opLabel(f.op)}
            {needsValue(f.op) && (
              <>{' '}<b className="text-content-primary font-medium">“{f.value}”</b></>
            )}
          </span>
          <button
            type="button"
            aria-label={`Remove condition ${i + 1}`}
            onClick={(e) => { e.stopPropagation(); remove(f.id) }}
            className={cn(
              'text-content-tertiary hover:text-content-primary flex size-5 shrink-0 cursor-pointer',
              'items-center justify-center rounded-[5px] hover:bg-stone-200/60',
              'opacity-0 group-hover/tok:opacity-100 focus-visible:opacity-100 outline-none',
            )}
          >
            ×
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={(e) => setSub({ kind: 'fields', at: subAnchor(e.currentTarget, 268) })}
        className={cn(
          'border-line-strong shadow-raised mx-2 mt-1.5 mb-1 flex h-[32px] cursor-pointer',
          'items-center gap-1.5 rounded-lg border bg-white px-3 text-[13px] font-medium text-stone-800',
          'transition-[background-color,transform] duration-150 ease-out-strong active:scale-[0.97]',
          'focus-visible:ring-ring/50 outline-none hover:bg-stone-50 focus-visible:ring-[3px]',
        )}
      >
        <PlusIcon className="text-content-secondary size-3.5" />
        Add condition
      </button>

      <div className="mt-0.5 flex items-center justify-between px-2 pt-1 pb-0.5">
        <span className="text-content-tertiary text-[12.5px] tabular-nums">
          {resultCount.toLocaleString('en-US')} contacts
        </span>
        <button
          type="button"
          onClick={clearAll}
          className={cn(
            'text-content-tertiary hover:text-content-primary cursor-pointer py-1 text-[12.5px] outline-none',
            !anyActive && 'invisible',
          )}
        >
          Clear all
        </button>
      </div>

      {/* ── sub-popovers — inside the panel's node, so outside-press logic
            treats them as part of it ── */}

      {sub?.kind === 'pin' && (
        <SubSurface at={sub.at} width={250} label={sub.pin === 'source' ? 'Source' : 'Accounts'}>
          {pinOptions.map(([label, count], i) => (
            <button
              key={label}
              type="button"
              onClick={() => {
                setPins((cur) => ({ ...cur, [sub.pin]: i }))
                setSub(null)
              }}
              className={cn(ROW, HOVER, 'h-8 gap-2 px-2 text-[13px]')}
            >
              <span className="min-w-0 flex-1 truncate">{label}</span>
              {i === pins[sub.pin] ? (
                <CheckIcon className="text-accent-ai size-3 shrink-0" />
              ) : (
                <span className="text-content-tertiary shrink-0 text-[11.5px] tabular-nums">
                  {count.toLocaleString('en-US')}
                </span>
              )}
            </button>
          ))}
        </SubSurface>
      )}

      {sub?.kind === 'fields' && (
        <FieldPicker
          at={sub.at}
          onPick={(field) =>
            setSub((cur) => cur && {
              kind: 'vals',
              at: cur.at,
              field,
              op: field === 'department' ? 'is' : 'contains',
              editingId: null,
              draft: '',
              showOps: false,
            })}
        />
      )}

      {sub?.kind === 'vals' && (
        <ValuePicker
          sub={sub}
          onPatch={(part) => setSub((cur) => (cur?.kind === 'vals' ? { ...cur, ...part } : cur))}
          onCommit={commit}
        />
      )}
    </div>,
    document.body,
  )
}

/** Shared chrome for the nested pickers. */
function SubSurface({
  at, width, label, children,
}: {
  at: Anchor
  width: number
  label: string
  children: React.ReactNode
}) {
  return (
    <div
      role="dialog"
      aria-label={label}
      style={{ left: at.x, top: at.y, width }}
      className={cn(
        'border-border-tertiary bg-card shadow-card fixed z-50 rounded-[11px] border p-1.5',
        'origin-top-left motion-safe:animate-menu-pop motion-reduce:animate-menu-in',
      )}
    >
      {children}
    </div>
  )
}

function FieldPicker({ at, onPick }: { at: Anchor; onPick: (f: FilterField) => void }) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => inputRef.current?.focus(), [])

  const q = query.trim().toLowerCase()
  const groups = FIELD_GROUPS
    .map((g) => ({ ...g, keys: g.keys.filter((k) => fieldLabel(k).toLowerCase().includes(q)) }))
    .filter((g) => g.keys.length > 0)
  const first = groups[0]?.keys[0]

  return (
    <SubSurface at={at} width={268} label="Filter by field">
      <div className="border-line -mx-1.5 mb-1 flex items-center gap-2 border-b px-3 pt-1 pb-2">
        <SearchIcon className="text-content-tertiary size-3.5 shrink-0" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && first) {
              e.preventDefault()
              onPick(first)
            }
          }}
          placeholder="Filter by…"
          className="placeholder:text-content-placeholder min-w-0 flex-1 bg-transparent text-[13px] outline-none"
        />
        <kbd className="border-line text-content-tertiary rounded border px-1 font-sans text-[10.5px]">esc</kbd>
      </div>

      {groups.length === 0 && (
        <p className="text-content-tertiary px-2 py-3 text-[12.5px]">
          No field matches “{query.trim()}”
        </p>
      )}
      {groups.map((g) => (
        <div key={g.label}>
          <div className={GROUP_LABEL}>{g.label}</div>
          {g.keys.map((key) => {
            const Icon = FIELD_ICONS[key]
            return (
              <button key={key} type="button" onClick={() => onPick(key)}
                className={cn(ROW, HOVER, 'h-8 gap-2.5 px-2 text-[13px]')}>
                <Icon className="text-content-tertiary size-3.5 shrink-0" />
                <span className="min-w-0 flex-1 truncate">{fieldLabel(key)}</span>
                <span className="text-content-tertiary shrink-0 text-[11px]">›</span>
              </button>
            )
          })}
        </div>
      ))}
    </SubSurface>
  )
}

/** The value step. The operator lives here — a bar up top, one click away. */
function ValuePicker({
  sub, onPatch, onCommit,
}: {
  sub: Extract<Sub, { kind: 'vals' }>
  onPatch: (part: Partial<Extract<Sub, { kind: 'vals' }>>) => void
  onCommit: (field: FilterField, op: FilterOp, value: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const isEnum = sub.field === 'department'
  const takesValue = needsValue(sub.op)

  useEffect(() => {
    if (!sub.showOps && takesValue && !isEnum) inputRef.current?.focus()
  }, [sub.showOps, takesValue, isEnum])

  if (sub.showOps) {
    return (
      <SubSurface at={sub.at} width={250} label="Operator">
        {OP_GROUPS.map((group, gi) => (
          <div key={gi}>
            {gi > 0 && <div className="bg-line mx-2 my-1 h-px" aria-hidden="true" />}
            {group.map((op) => (
              <button key={op} type="button"
                onClick={() => onPatch({ op, showOps: false })}
                className={cn(ROW, HOVER, 'h-8 gap-2 px-2 text-[13px]')}>
                <span className="min-w-0 flex-1 truncate">{opLabel(op)}</span>
                {op === sub.op && <CheckIcon className="text-accent-ai size-3 shrink-0" />}
              </button>
            ))}
          </div>
        ))}
      </SubSurface>
    )
  }

  return (
    <SubSurface at={sub.at} width={250} label={`${fieldLabel(sub.field)} filter`}>
      <button
        type="button"
        onClick={() => onPatch({ showOps: true })}
        className={cn(ROW, HOVER, 'border-line -mx-1.5 -mt-1.5 mb-1 h-9 w-[calc(100%+12px)] gap-1.5 rounded-b-none border-b px-3')}
      >
        <span className="text-content-tertiary text-[12.5px]">{fieldLabel(sub.field)}</span>
        <span className="text-content-primary text-[13px] font-medium">{opLabel(sub.op)}</span>
        <ChevronDownIcon className="text-content-tertiary ml-auto size-3 shrink-0" />
      </button>

      {!takesValue ? (
        <>
          <p className="text-content-tertiary px-2 py-2 text-[12.5px] leading-relaxed">
            No value needed — matches every contact where {fieldLabel(sub.field)}{' '}
            {opLabel(sub.op)}.
          </p>
          <CommitBar onClick={() => onCommit(sub.field, sub.op, '')} />
        </>
      ) : isEnum ? (
        <>
          <div className={GROUP_LABEL}>Select a value</div>
          {DEPT_OPTIONS.map(([value, count]) => (
            <button key={value} type="button"
              onClick={() => onCommit(sub.field, sub.op, value)}
              className={cn(ROW, HOVER, 'h-8 gap-2 px-2 text-[13px]')}>
              <span className="min-w-0 flex-1 truncate">{value}</span>
              <span className="text-content-tertiary shrink-0 text-[11.5px] tabular-nums">
                {count}
              </span>
            </button>
          ))}
        </>
      ) : (
        <>
          <input
            ref={inputRef}
            value={sub.draft}
            onChange={(e) => onPatch({ draft: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && sub.draft.trim()) {
                e.preventDefault()
                onCommit(sub.field, sub.op, sub.draft.trim())
              }
            }}
            placeholder="Enter value…"
            className="placeholder:text-content-placeholder w-full bg-transparent px-2 py-2 text-[13px] outline-none"
          />
          <CommitBar
            disabled={!sub.draft.trim()}
            onClick={() => onCommit(sub.field, sub.op, sub.draft.trim())}
          />
        </>
      )}
    </SubSurface>
  )
}

function CommitBar({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <div className="border-line -mx-1.5 -mb-1.5 mt-1 flex justify-end border-t p-1.5">
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        className={cn(
          'bg-os-gray-950 hover:bg-os-gray-800 flex h-7 cursor-pointer items-center rounded-[7px]',
          'px-3 text-[12.5px] font-medium text-white outline-none',
          'focus-visible:ring-ring/50 focus-visible:ring-[3px]',
          'disabled:bg-os-gray-100 disabled:text-content-tertiary disabled:cursor-default',
        )}
      >
        Apply
      </button>
    </div>
  )
}
