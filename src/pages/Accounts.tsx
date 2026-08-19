import { useState } from 'react'
import { cn } from '@/lib/cn'
import {
  ACCOUNTS_TABLE_WIDTH, ACCOUNT_COLUMNS, ACCOUNT_HEADER_HEIGHT, ACCOUNT_ROW_HEIGHT,
  accounts,
} from '@/data/accounts'
import { faviconUrl } from '@/data/contacts'
import { Checkbox } from '@/components/ui/checkbox'
import { Sidebar } from '@/components/rox/Sidebar'
import { AddColumnModal } from '@/components/rox/AddColumnModal'
import {
  ChevronDownIcon, EllipsisIcon, PlusIcon, SearchIcon, SortIcon,
} from '@/components/rox/icons'
import {
  FindCompanyJobOpeningsIcon, NewManualColumnsIcon,
} from '@/components/rox/modalIcons'

/* ────────────────────────────────────────────────────────────────────────────
 * Accounts, rebuilt from the screenshot. Measured at a verified 1.1574 scale
 * (the 212px sidebar is 246 image px), so the numbers below are real values.
 *
 * Two things here differ from the People page and are deliberate, not drift:
 *   • the top bar, toolbar and tab strip sit on the warm grey app background;
 *     white begins at the table body, not at a rounded panel.
 *   • rows are 45 high, and the active view tab is a soft blue pill with blue
 *     text rather than the solid indigo People uses.
 * ──────────────────────────────────────────────────────────────────────────── */

const CONTROL =
  'flex h-[32px] shrink-0 cursor-pointer items-center gap-2 rounded-lg px-3 ' +
  'text-[14px] whitespace-nowrap transition-colors outline-none ' +
  'focus-visible:ring-ring/50 focus-visible:ring-[3px]'
const BORDERED = 'border-button-border text-content-primary hover:bg-os-gray-100 border bg-white'

function DashedCircle() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="size-3.5 shrink-0">
      <circle cx="8" cy="8" r="6.1" stroke="currentColor" strokeWidth="1.4" strokeDasharray="3.4 2.8" />
    </svg>
  )
}

function ListIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="size-3.5 shrink-0">
      <path d="M2.5 4h11M2.5 8h11M2.5 12h7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function FunnelIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="size-3.5 shrink-0">
      <path d="M2.5 3.5h11l-4.2 5v4l-2.6 1.4V8.5z" stroke="currentColor" strokeWidth="1.4"
        strokeLinejoin="round" />
    </svg>
  )
}

/** The three density toggles pinned to the toolbar's right edge. */
function ViewModeIcon({ rows }: { rows: number }) {
  return (
    <svg viewBox="0 0 20 16" fill="none" aria-hidden="true" className="size-4">
      <rect x="1.6" y="2.2" width="16.8" height="11.6" rx="2.2" stroke="currentColor" strokeWidth="1.4" />
      {Array.from({ length: rows }, (_, i) => (
        <path key={i} d={`M1.6 ${5.5 + i * (8.4 / rows)}h16.8`} stroke="currentColor" strokeWidth="1.3" />
      ))}
    </svg>
  )
}

const VIEWS: { label: string; shared?: boolean }[] = [
  { label: 'Default' },
  { label: 'Example' },
  { label: 'New view' },
  { label: 'Philips RHT Sales Play', shared: true },
  { label: 'test-alexh-orgwide', shared: true },
  { label: 'Customer onboarding dashboard', shared: true },
  { label: '[DCG] Datacenter Goldrush Sales Play', shared: true },
  { label: 'Rox Customer List', shared: true },
]

function SharedIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="size-3.5 shrink-0">
      <circle cx="6.2" cy="6" r="2.2" stroke="currentColor" strokeWidth="1.3" />
      <path d="M2.4 12.6a3.9 3.9 0 0 1 7.6 0M10.6 4.2a2 2 0 0 1 0 3.6M11.6 9.6c1.2.4 2 1.6 2 3"
        stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

function ViewTab({ label, shared, active }: { label: string; shared?: boolean; active?: boolean }) {
  return (
    <button
      type="button"
      aria-current={active ? 'true' : undefined}
      className={cn(
        'group/tab flex h-[32px] max-w-[240px] shrink-0 cursor-pointer items-center gap-1.5',
        'rounded-lg border px-3 text-[14px] whitespace-nowrap outline-none',
        'transition-[background-color,border-color,color] duration-150 ease-out-strong',
        'focus-visible:ring-ring/50 focus-visible:ring-[3px]',
        /* Border always present, colour-only change — see the note on the
           People tabs: dropping it narrowed the active pill by 2px. */
        active
          ? 'bg-accent-select/10 text-accent-select border-transparent font-medium'
          : 'border-button-border text-content-primary hover:bg-os-gray-100 bg-white',
      )}
    >
      {shared && <SharedIcon />}
      <span className="text-steady" data-text={label}>
        <span className={cn(
          'block truncate origin-center transition-transform duration-150 ease-out-strong',
          'group-active/tab:scale-[0.97]',
        )}>
          {label}
        </span>
      </span>
      <ChevronDownIcon className={cn('shrink-0', active ? 'opacity-80' : 'text-content-tertiary')} />
    </button>
  )
}

/** Grey header cell. The trailing Add column cell is white — see the capture. */
function HeaderCell({
  width, children, className, sticky,
}: {
  width: number
  children?: React.ReactNode
  className?: string
  sticky?: boolean
}) {
  return (
    <th
      scope="col"
      style={{ width, height: ACCOUNT_HEADER_HEIGHT, ...(sticky ? { position: 'sticky', left: 0, zIndex: 20 } : null) }}
      className={cn(
        'bg-card border-border-tertiary border-t border-r border-b px-3 text-left',
        'text-[13px] font-medium whitespace-nowrap',
        className,
      )}
    >
      {children}
    </th>
  )
}

function Cell({
  width, children, className, sticky,
}: {
  width: number
  children?: React.ReactNode
  className?: string
  sticky?: boolean
}) {
  return (
    <td
      style={{ width, height: ACCOUNT_ROW_HEIGHT, ...(sticky ? { position: 'sticky', left: 0, zIndex: 10 } : null) }}
      className={cn(
        'bg-card border-border-tertiary relative border-r border-b px-3 align-middle',
        'after:pointer-events-none after:absolute after:inset-0 group-hover:after:bg-overlay-secondary',
        'after:transition-colors after:duration-150',
        className,
      )}
    >
      {children}
    </td>
  )
}

export function Accounts({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [addColumnOpen, setAddColumnOpen] = useState(false)

  const q = query.trim().toLowerCase()
  const rows = q
    ? accounts.filter((a) => a.name.toLowerCase().includes(q) || a.domain.includes(q))
    : accounts

  const allSelected = rows.length > 0 && rows.every((r) => selected.has(r.id))
  const someSelected = !allSelected && rows.some((r) => selected.has(r.id))

  const toggleRow = (id: string) =>
    setSelected((cur) => {
      const next = new Set(cur)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const toggleAll = () =>
    setSelected((cur) => {
      const next = new Set(cur)
      if (allSelected) rows.forEach((r) => next.delete(r.id))
      else rows.forEach((r) => next.add(r.id))
      return next
    })

  return (
    <div className="bg-app-bg flex h-full w-full overflow-hidden">
      <Sidebar active="Accounts" onNavigate={onNavigate} />

      {/* Same shell as People: a rounded white panel floating on the app
          background. The capture showed this page on the bare grey ground, but
          the two pages are meant to read as one product. */}
      <div className="flex min-w-0 flex-1 flex-col py-3 pr-3">
        <div className="bg-card border-card-border shadow-main-panel flex min-h-0 flex-1 flex-col overflow-hidden rounded-[14px] border">
        {/* ── top bar — 70 high ──────────────────────────────────────────── */}
        <header className="flex h-[70px] shrink-0 items-center justify-between px-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="bg-accent-pink/10 flex size-[30px] shrink-0 items-center justify-center rounded-lg">
              <FindCompanyJobOpeningsIcon className="text-accent-pink size-[17px]" />
            </span>
            <h1 className="text-content-primary truncate text-[22px] font-medium">Accounts</h1>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setAddColumnOpen(true)}
              className="bg-secondary text-secondary-foreground hover:bg-secondary-hover focus-visible:ring-ring/50 flex h-[36px] cursor-pointer items-center rounded-lg px-3 text-[14px] font-medium transition-colors outline-none focus-visible:ring-[3px]"
            >
              Add column
            </button>
            <button
              type="button"
              className="border-button-border bg-button text-foreground shadow-button hover:bg-button-hover focus-visible:ring-ring/50 flex h-[36px] cursor-pointer items-center gap-1.5 rounded-lg border px-3 text-[14px] font-medium transition-colors outline-none focus-visible:ring-[3px]"
            >
              Add account
              <ChevronDownIcon className="text-content-tertiary" />
            </button>
            <button
              type="button"
              aria-label="Chat"
              className="border-button-border text-content-secondary hover:bg-os-gray-100 focus-visible:ring-ring/50 flex size-[36px] cursor-pointer items-center justify-center rounded-full border bg-white outline-none focus-visible:ring-[3px]"
            >
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="size-4">
                <path d="M17.2 9.6a6.6 6 0 0 1-6.6 6 8 8 0 0 1-3-.6l-3.8 1.2 1.1-3.1a5.8 5.8 0 0 1-1.1-3.5 6.6 6 0 0 1 6.8-6 6.6 6 0 0 1 6.6 6z"
                  stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </header>

        {/* Same rhythm as People — one stack, gap-3, pb-3. Accounts puts the
            toolbar above the tabs; People is the other way round. */}
        <div className="flex shrink-0 flex-col gap-3 pb-3">
        <div className="flex shrink-0 items-center gap-2 px-4">
          <label className={cn(CONTROL, BORDERED, 'w-[190px] gap-2 px-2.5')}>
            <SearchIcon className="text-content-tertiary shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              aria-label="Search accounts"
              className="placeholder:text-content-tertiary min-w-0 flex-1 bg-transparent outline-none"
            />
          </label>

          <button type="button" className={cn(CONTROL, BORDERED)}>
            <DashedCircle /> All Sources <ChevronDownIcon className="text-content-tertiary" />
          </button>
          <button type="button" className={cn(CONTROL, BORDERED)}>
            <ListIcon /> Flat <ChevronDownIcon className="text-content-tertiary" />
          </button>
          <button type="button" className={cn(CONTROL, BORDERED)}>
            <FunnelIcon /> Filter <ChevronDownIcon className="text-content-tertiary" />
          </button>
          <button type="button" className={cn(CONTROL, BORDERED)}>
            <SortIcon className="size-3.5 shrink-0" /> Sort
            <ChevronDownIcon className="text-content-tertiary" />
          </button>

          <div className="ml-auto flex shrink-0 items-center gap-1">
            {[1, 2, 3].map((rows_) => (
              <button
                key={rows_}
                type="button"
                aria-label={`Row density ${rows_}`}
                className="text-content-tertiary hover:bg-os-gray-100 hover:text-content-primary focus-visible:ring-ring/50 flex size-[30px] cursor-pointer items-center justify-center rounded-md outline-none focus-visible:ring-[3px]"
              >
                <ViewModeIcon rows={rows_} />
              </button>
            ))}
          </div>
        </div>

        {/* ── view tabs ──────────────────────────────────────────────────── */}
        <div className="flex shrink-0 items-center gap-1.5 overflow-hidden px-4">
          {VIEWS.map((v, i) => (
            <ViewTab key={v.label} label={v.label} shared={v.shared} active={i === 0} />
          ))}
          <button
            type="button"
            aria-label="Add view"
            className="text-content-tertiary hover:bg-os-gray-100 focus-visible:ring-ring/50 flex size-[32px] shrink-0 cursor-pointer items-center justify-center rounded-lg outline-none focus-visible:ring-[3px]"
          >
            <PlusIcon />
          </button>
        </div>
        </div>

        {/* ── grid ───────────────────────────────────────────────────────── */}
        <div className="bg-card min-h-0 flex-1 overflow-auto">
          <table
            className="table-fixed border-separate border-spacing-0"
            style={{ width: ACCOUNTS_TABLE_WIDTH }}
          >
            <caption className="sr-only">
              Accounts. {rows.length} of {accounts.length} rows shown.
            </caption>
            <colgroup>
              <col style={{ width: ACCOUNT_COLUMNS.select }} />
              <col style={{ width: ACCOUNT_COLUMNS.name }} />
              <col style={{ width: ACCOUNT_COLUMNS.domain }} />
              <col style={{ width: ACCOUNT_COLUMNS.addColumn }} />
            </colgroup>

            <thead>
              <tr>
                <HeaderCell width={ACCOUNT_COLUMNS.select} sticky className="px-0">
                  <span className="flex w-full items-center pl-4">
                    <Checkbox
                      checked={allSelected}
                      indeterminate={someSelected}
                      onChange={toggleAll}
                      label={allSelected ? 'Deselect all accounts' : 'Select all accounts'}
                    />
                  </span>
                </HeaderCell>

                <HeaderCell width={ACCOUNT_COLUMNS.name}>
                  <span className="group/h flex items-center gap-2">
                    <FindCompanyJobOpeningsIcon className="text-content-tertiary size-[15px]" />
                    <span className="text-content-primary flex-1">Account ({accounts.length})</span>
                    <EllipsisIcon className="text-content-tertiary size-3.5 opacity-0 transition-opacity group-hover/h:opacity-100" />
                  </span>
                </HeaderCell>

                <HeaderCell width={ACCOUNT_COLUMNS.domain}>
                  <span className="flex items-center gap-2">
                    <NewManualColumnsIcon className="text-content-tertiary size-[15px]" />
                    <span className="text-content-primary flex-1">Domain</span>
                    <span className="bg-os-gray-100 text-content-tertiary flex size-[18px] items-center justify-center rounded-full">
                      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="size-[11px]">
                        <rect x="3.6" y="7" width="8.8" height="6" rx="1.6" stroke="currentColor" strokeWidth="1.4" />
                        <path d="M5.8 7V5.4a2.2 2.2 0 0 1 4.4 0V7" stroke="currentColor" strokeWidth="1.4" />
                      </svg>
                    </span>
                  </span>
                </HeaderCell>

                {/* White, unlike the other header cells. */}
                <HeaderCell width={ACCOUNT_COLUMNS.addColumn} className="bg-card">
                  <button
                    type="button"
                    onClick={() => setAddColumnOpen(true)}
                    className="text-content-primary hover:bg-os-gray-75 focus-visible:ring-ring/50 -mx-1.5 flex h-[26px] cursor-pointer items-center gap-1.5 rounded-md px-1.5 outline-none focus-visible:ring-[3px]"
                  >
                    <PlusIcon className="text-content-tertiary" />
                    Add column
                  </button>
                </HeaderCell>
              </tr>
            </thead>

            <tbody>
              {rows.map((row, index) => {
                const isSelected = selected.has(row.id)
                return (
                  <tr key={row.id} className="group">
                    <Cell width={ACCOUNT_COLUMNS.select} sticky className="px-0">
                      <span className="relative flex h-full w-full items-center pl-4">
                        {/* Number yields to the checkbox on hover or selection,
                            which is the state row 4 is caught in mid-capture. */}
                        <span
                          className={cn(
                            'text-content-tertiary text-xs tabular-nums transition-opacity duration-150',
                            'group-hover:opacity-0',
                            isSelected && 'opacity-0',
                          )}
                        >
                          {index + 1}
                        </span>
                        <span
                          className={cn(
                            'absolute inset-y-0 left-4 flex items-center transition-opacity duration-150',
                            'opacity-0 group-hover:opacity-100 focus-within:opacity-100',
                            isSelected && 'opacity-100',
                          )}
                        >
                          <Checkbox
                            checked={isSelected}
                            onChange={() => toggleRow(row.id)}
                            label={`Select ${row.name}`}
                          />
                        </span>
                      </span>
                    </Cell>

                    <Cell width={ACCOUNT_COLUMNS.name}>
                      <span className="relative flex min-w-0 items-center gap-2.5">
                        <img
                          src={faviconUrl(row.domain)}
                          alt=""
                          aria-hidden="true"
                          className="size-[18px] shrink-0 rounded object-contain"
                        />
                        <span className="text-content-primary min-w-0 truncate text-[14px] group-hover:underline">
                          {row.name}
                        </span>
                      </span>
                    </Cell>

                    <Cell width={ACCOUNT_COLUMNS.domain}>
                      <span className="text-content-secondary relative block truncate text-[14px]">
                        {row.domain}
                      </span>
                    </Cell>

                    <Cell width={ACCOUNT_COLUMNS.addColumn} />
                  </tr>
                )
              })}

              {rows.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-content-tertiary px-4 py-10 text-center text-[13px]">
                    No accounts match “{query}”.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        </div>
      </div>

      <AddColumnModal open={addColumnOpen} onClose={() => setAddColumnOpen(false)} />
    </div>
  )
}
