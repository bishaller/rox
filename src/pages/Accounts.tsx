import { type CSSProperties, useState } from 'react'
import { cn } from '@/lib/cn'
import {
  ACCOUNT_COLUMNS, ACCOUNT_HEADER_HEIGHT, ACCOUNT_ROW_HEIGHT, accounts,
} from '@/data/accounts'
import { brandMark } from '@/data/contacts'
import { Checkbox } from '@/components/ui/checkbox'
import { Sidebar } from '@/components/rox/Sidebar'
import { AddColumnModal } from '@/components/rox/AddColumnModal'
import {
  ArrowUpArrowDownIcon, CommentIcon, ExternalLinkIcon, FunnelIcon,
  PlusCircleIcon, PlusIcon, SearchIcon,
} from '@/components/rox/icons'
import avatarBen from '@/assets/avatar-ben.png'
import avatarBishal from '@/assets/avatar-bishal.png'

/* ────────────────────────────────────────────────────────────────────────────
 * Accounts, built to frame 3779:3653 — the same design language as the
 * redesigned People page. One 48px top band (20px title, raised Add Account,
 * comment glyph), one row of view pills with the toolbar on its right, and a
 * grid that runs 48 · 230 · 160 with the Add-column rail absorbing the rest of
 * the panel.
 *
 * Two things the frame rules differently from People and are kept: the number
 * gutter survives here (People folded its checkbox into the Contact cell), and
 * the search box sits on the grey stone-100 ground rather than white-in-border.
 * ──────────────────────────────────────────────────────────────────────────── */

/* Top-bar actions share the People TopBar's box: 36 high, press dip, only the
   primary action raised. */
const ACTION =
  'flex h-[36px] shrink-0 cursor-pointer items-center justify-center rounded-[8px] ' +
  'text-[14px] font-medium whitespace-nowrap outline-none ' +
  'transition-[background-color,border-color,color,transform] duration-150 ease-out-strong ' +
  'active:scale-[0.97] ' +
  'focus-visible:ring-ring/50 focus-visible:ring-[3px]'

/* Filter and Sort match the People toolbar: icon-only, 32 high, no border. */
const ICON_CONTROL =
  'relative flex h-[32px] shrink-0 cursor-pointer items-center justify-center rounded-[8px] px-2 ' +
  'text-stone-600 outline-none hover:bg-stone-100 ' +
  'transition-[background-color,color,transform] duration-150 ease-out-strong active:scale-[0.95] ' +
  'focus-visible:ring-ring/50 focus-visible:ring-[3px]'

function ClearIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="size-3.5">
      <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

/** Saved views, as in the frame — two of them carrying a sharer's photo. */
const VIEWS: { label: string; avatar?: string }[] = [
  { label: 'Default' },
  { label: 'My Lists' },
  { label: 'Philips RHT sales play', avatar: avatarBen },
  { label: 'Customer onboarding dashboard', avatar: avatarBishal },
]

/**
 * A view pill — the People tab treatment: rounded-full, stone ground for the
 * active view, no chevron. The label is width-steady so selecting a view does
 * not shuffle the pills beside it.
 */
function ViewTab({
  label, avatar, active, onSelect,
}: {
  label: string
  avatar?: string
  active?: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      aria-current={active ? 'true' : undefined}
      onClick={onSelect}
      className={cn(
        'group/tab flex h-[32px] max-w-[300px] shrink-0 cursor-pointer items-center',
        'rounded-full border px-2.5 text-[14px] whitespace-nowrap outline-none select-none',
        'transition-[background-color,border-color,color] duration-150 ease-out-strong',
        'focus-visible:ring-ring/50 focus-visible:ring-[3px]',
        /* Border always present, colour-only change — dropping it narrowed the
           active pill by 2px and shifted every pill after it. */
        active
          ? 'border-stone-400 bg-stone-200 font-medium text-stone-800'
          : 'border-stone-200 bg-white text-stone-800',
      )}
    >
      {/* Everything inside the pill takes the press together; the chrome holds
          still, and scale does not affect layout. */}
      <span className={cn(
        'flex min-w-0 origin-center items-center gap-1.5',
        'transition-transform duration-150 ease-out-strong group-active/tab:scale-[0.97]',
      )}>
        {avatar && (
          <img src={avatar} alt="" aria-hidden="true"
            className="size-4 shrink-0 rounded-full object-cover" />
        )}
        <span className="text-steady" data-text={label}>
          <span className="block truncate">{label}</span>
        </span>
      </span>
    </button>
  )
}

/**
 * The company mark in the Domain column — the frame draws the brand lettermark
 * (19px, brand ground, white semibold), not the live favicon.
 */
function BrandMark({ domain }: { domain: string }) {
  const { label, className } = brandMark(domain)
  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex size-[19px] shrink-0 items-center justify-center rounded-[4px]',
        'leading-none font-semibold tracking-tight text-white',
        /* Two letters in a 19px box need the step down or they touch the
           edges — the frame sets `CB` at 8 and `P` at 10. */
        label.length > 1 ? 'text-[8px]' : 'text-[10px]',
        className,
      )}
    >
      {label}
    </span>
  )
}

/**
 * Header cell. The frame rules the header top and bottom in stone-200 and its
 * verticals in the lighter --color-line, and pins it to the scroller's top.
 */
function HeaderCell({
  children, className,
}: {
  children?: React.ReactNode
  className?: string
}) {
  return (
    <th
      scope="col"
      style={{ height: ACCOUNT_HEADER_HEIGHT, position: 'sticky', top: 0, zIndex: 30 }}
      className={cn(
        'text-ink bg-white px-3 text-left text-[14px] font-medium whitespace-nowrap',
        'border-t border-b border-t-stone-200 border-b-stone-200',
        'border-r-line border-r',
        className,
      )}
    >
      {children}
    </th>
  )
}

function Cell({
  children, className, selected,
}: {
  children?: React.ReactNode
  className?: string
  selected?: boolean
}) {
  return (
    <td
      style={{ height: ACCOUNT_ROW_HEIGHT }}
      className={cn(
        'group/cell text-ink bg-card relative px-3 align-middle',
        'border-b-line border-r-line border-r border-b',
        'after:pointer-events-none after:absolute after:inset-0 group-hover:after:bg-overlay-row-hover',
        'transition-colors duration-150 after:transition-colors after:duration-150',
        selected && 'bg-accent-select/5',
        className,
      )}
    >
      {/* The entrance animation lives on this wrapper, never on the <td>: a
          transform there would create a stacking surprise under the sticky
          header. */}
      <div className={cn(
        'flex h-full w-full min-w-0 items-center overflow-hidden',
        'motion-safe:animate-row-in [animation-delay:calc(var(--row-i,0)*14ms)]',
      )}>
        {children}
      </div>
    </td>
  )
}

export function Accounts({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [addColumnOpen, setAddColumnOpen] = useState(false)
  const [activeView, setActiveView] = useState(0)

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

      {/* Main panel — rounded card floating on the app background, as on People. */}
      <div className="flex min-w-0 flex-1 flex-col py-3 pr-3">
        <div className="bg-card border-card-border shadow-main-panel flex min-h-0 flex-1 flex-col overflow-hidden rounded-[14px] border">
        {/* ── top bar — 48 total: a 36px action row set 12px down ─────────── */}
        <header className="flex shrink-0 items-center justify-between pt-3 pr-3 pl-4">
          {/* Same inset as the People breadcrumb: the title's 6px pad starts
              on the container's edge, aligning it with the first view pill. */}
          <h1 className="text-ink flex h-[36px] min-w-0 items-center truncate px-1.5 text-[20px] font-medium tracking-normal">
            Accounts
          </h1>

          <div className="flex shrink-0 items-center gap-2">
            {/* The only raised control on the screen. */}
            <button
              type="button"
              className={cn(ACTION,
                'border-line-strong shadow-raised border bg-white px-3 text-stone-800 hover:bg-stone-50')}
            >
              Add Account
            </button>

            {/* Borderless — it reads as an icon affordance, not a button. */}
            <button type="button" aria-label="Chat"
              className={cn(ACTION, 'size-[36px] shrink-0 p-0 text-stone-600 hover:bg-stone-100')}>
              <CommentIcon className="shrink-0" />
            </button>
          </div>
        </header>

        {/* ── one 48px band: saved views left, search and glyphs right ────── */}
        <div className="flex shrink-0 items-center justify-between gap-3 px-4 pt-4">
          <div className="flex min-w-0 shrink items-center gap-1">
            {VIEWS.map((v, i) => (
              <ViewTab key={v.label} label={v.label} avatar={v.avatar}
                active={i === activeView} onSelect={() => setActiveView(i)} />
            ))}
            <button
              type="button"
              aria-label="Add view"
              className="focus-visible:ring-ring/50 flex size-[32px] shrink-0 cursor-pointer items-center justify-center rounded-full text-stone-600 outline-none transition-[background-color,transform] duration-150 ease-out-strong hover:bg-stone-100 active:scale-[0.95] focus-visible:ring-[3px]"
            >
              <PlusIcon className="size-3.5" />
            </button>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            {/* The frame sits this search on the grey stone-100 ground, not
                white-in-border as on People; the border only exists focused. */}
            <div data-slot="input-group"
              className="focus-within:border-ring flex h-[32px] w-[289px] items-center gap-[5px] rounded-[8px] border border-transparent bg-stone-100 px-2">
              <SearchIcon className="size-4 shrink-0 text-stone-400" />
              <input
                data-slot="input-group-control"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search accounts..."
                aria-label="Search accounts"
                className="text-ink min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-stone-400 [&::-webkit-search-cancel-button]:hidden"
              />
              {query && (
                <button type="button" onClick={() => setQuery('')} aria-label="Clear search"
                  className="shrink-0 cursor-pointer text-stone-400 hover:text-stone-800">
                  <ClearIcon />
                </button>
              )}
            </div>

            <button type="button" aria-label="Filter" className={ICON_CONTROL}>
              <FunnelIcon className="size-4" />
            </button>
            <button type="button" aria-label="Sort" className={ICON_CONTROL}>
              <ArrowUpArrowDownIcon className="size-4" />
            </button>
          </div>
        </div>

        {/* ── grid — edge to edge; the Add-column rail absorbs the rest ───── */}
        <div className="bg-card min-h-0 flex-1 overflow-auto pt-4 pb-4">
          <table className="w-full table-fixed border-separate border-spacing-0">
            <caption className="sr-only">
              Accounts. {rows.length} of {accounts.length} rows shown.
            </caption>
            <colgroup>
              <col style={{ width: ACCOUNT_COLUMNS.select }} />
              <col style={{ width: ACCOUNT_COLUMNS.name }} />
              <col style={{ width: ACCOUNT_COLUMNS.domain }} />
              <col />
            </colgroup>

            <thead>
              <tr>
                <HeaderCell className="px-0">
                  <span className="flex w-full items-center justify-center">
                    <Checkbox
                      checked={allSelected}
                      indeterminate={someSelected}
                      onChange={toggleAll}
                      label={allSelected ? 'Deselect all accounts' : 'Select all accounts'}
                    />
                  </span>
                </HeaderCell>

                <HeaderCell>Sales Accounts</HeaderCell>
                <HeaderCell>Domain</HeaderCell>

                {/* The rail's own header row: stone-200 left rule, the lighter
                    line under it, and no vertical rule at its right edge. */}
                <HeaderCell className="border-b-line border-l-stone-200 border-r-0 border-l px-0">
                  <span className="flex w-full items-center px-1">
                    <button
                      type="button"
                      onClick={() => setAddColumnOpen(true)}
                      className={cn(
                        'focus-visible:ring-ring/50 flex h-[30px] cursor-pointer items-center',
                        'gap-1.5 rounded-[8px] px-2 text-[14px] font-medium whitespace-nowrap',
                        'text-stone-800 outline-none',
                        'transition-[background-color,transform] duration-150 ease-out-strong active:scale-[0.97]',
                        'hover:bg-stone-100 focus-visible:ring-[3px]',
                      )}
                    >
                      <PlusCircleIcon className="size-4 shrink-0 text-stone-400" />
                      Add column
                    </button>
                  </span>
                </HeaderCell>
              </tr>
            </thead>

            <tbody>
              {rows.map((row, index) => {
                const isSelected = selected.has(row.id)
                const isLast = index === rows.length - 1
                return (
                  <tr
                    key={row.id}
                    className="group"
                    /* Capped so a deep row does not wait out a long stagger. */
                    style={{ '--row-i': Math.min(index, 16) } as CSSProperties}
                  >
                    <Cell selected={isSelected} className="px-0">
                      <span className="relative flex h-full w-full items-center justify-center">
                        {/* Number yields to the checkbox on hover or selection. */}
                        <span
                          className={cn(
                            'text-[13px] font-medium text-stone-400 tabular-nums transition-opacity duration-150',
                            'group-hover:opacity-0',
                            isSelected && 'opacity-0',
                          )}
                        >
                          {index + 1}
                        </span>
                        <span
                          className={cn(
                            'absolute inset-0 flex items-center justify-center transition-opacity duration-150',
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

                    <Cell selected={isSelected}>
                      {/* The hover underline is drawn, not text-decoration — a
                          decoration can't animate, and this one rises 2px into
                          place, as on People. */}
                      <span className={cn(
                        'relative min-w-0 overflow-hidden text-[14px] font-medium text-clip whitespace-nowrap',
                        'after:absolute after:inset-x-0 after:bottom-[2px] after:h-px after:bg-stone-400',
                        'after:translate-y-[2px] after:opacity-0',
                        'after:transition-[opacity,transform] after:duration-100 after:ease-out-strong',
                        'group-hover:after:translate-y-0 group-hover:after:opacity-100',
                      )}>
                        {row.name}
                      </span>
                    </Cell>

                    <Cell selected={isSelected}>
                      <span className="flex min-w-0 items-center gap-[9px]">
                        <BrandMark domain={row.domain} />
                        <a
                          href={`https://${row.domain}`}
                          target="_blank"
                          rel="noreferrer"
                          className="focus-visible:ring-ring/50 inline-flex min-w-0 items-center gap-1 rounded-sm text-[14px] outline-none hover:underline focus-visible:ring-[3px]"
                        >
                          <span className="overflow-hidden text-clip whitespace-nowrap">{row.domain}</span>
                          {/* The open-in-new glyph only surfaces when the row
                              is under the cursor — at rest the column is just
                              domains, as in the frame. */}
                          <ExternalLinkIcon className={cn(
                            'text-content-quaternary shrink-0 opacity-0 transition-opacity duration-150',
                            'group-hover:opacity-100 group-focus-within/cell:opacity-100',
                          )} />
                        </a>
                      </span>
                    </Cell>

                    {/* The rail: blank white, ruled only on its stone-200 left
                        edge — no row rules and no hover tint, so it reads as
                        margin rather than a column. Its bottom closes with the
                        last row. */}
                    <td
                      style={{ height: ACCOUNT_ROW_HEIGHT }}
                      className={cn(
                        'border-l-stone-200 border-l bg-white',
                        isLast && 'border-b-stone-200 border-b',
                      )}
                    />
                  </tr>
                )
              })}

              {rows.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-content-tertiary border-b-line border-b px-4 py-10 text-center text-[13px]">
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
