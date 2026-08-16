import { type CSSProperties, useMemo, useState } from 'react'
import { type Contact, contacts, faviconUrl } from '@/data/contacts'
import { Checkbox } from '@/components/ui/checkbox'
import { Tag } from '@/components/ui/tag'
import { cn } from '@/lib/cn'
import { useTableConfig } from '@/dev/tableConfig'
import {
  DataCell, EmptyValue, FooterCell, HeaderCell, type SortDirection, TextValue,
} from './DataCell'
import {
  ExternalLinkIcon, LinkedInBadge, OpenIcon, PlayCircleIcon, PlusIcon, RefreshIcon,
} from './icons'

const AI_COL = 'categorize_the_people_from_the_kind_of_work_they_d'

type SortKey = Extract<
  keyof Contact,
  'name' | 'title' | 'email' | 'companyName' | 'companyDomain' | 'linkedinUrl' | 'department'
>

/**
 * Widths measured from the design PNG (scale-verified against the 212px sidebar):
 * 231 · 214 · 210 · 130 · 149 · 115 · 160 · 140 · 108, plus a 40px gutter.
 * The gutter was measured at 46 but is squared off to the 40px header height.
 *
 * `contact_2` is a genuine duplicate column in the design; reproduced deliberately.
 */
const COLUMNS: { id: string; label: string; width: number; sortKey?: SortKey; flex?: boolean }[] = [
  // Square: matches HEADER_HEIGHT, so the gutter reads as a 40×40 cell.
  { id: 'select', label: '', width: 40 },
  { id: 'name', label: 'Contact', width: 231, sortKey: 'name' },
  { id: 'title', label: 'Title', width: 214, sortKey: 'title' },
  { id: 'email', label: 'Email', width: 210, sortKey: 'email' },
  { id: 'company_name', label: 'Company', width: 130, sortKey: 'companyName' },
  { id: 'company_domain', label: 'Domain', width: 149, sortKey: 'companyDomain' },
  { id: 'linkedin_url', label: 'Linkedin', width: 115, sortKey: 'linkedinUrl' },
  { id: 'contact_2', label: 'Contact', width: 160, sortKey: 'name' },
  // `flex` marks the column that absorbs any width beyond the design total.
  { id: AI_COL, label: 'Department / Work', width: 140, sortKey: 'department', flex: true },
  { id: 'addColumn', label: '', width: 108 },
]

/** The design shows only the path portion, e.g. `/deepalidsfd…`. */
function linkedinPath(url: string) {
  return url.replace(/^.*linkedin\.com\/in/i, '') || url
}

/** Design total (1503). The table never renders narrower than this. */
const TABLE_MIN_WIDTH = COLUMNS.reduce((n, c) => n + c.width, 0)

/**
 * The name column pins flush against the select column, so this MUST equal the
 * select column's width. Any mismatch opens a seam that the panel shows white
 * through on every sticky row.
 */
const NAME_STICKY_LEFT = `${COLUMNS[0].width}px`

/** Fields the search box matches against. */
const SEARCHABLE: (keyof Contact)[] = [
  'name', 'title', 'email', 'companyName', 'companyDomain', 'linkedinUrl', 'department',
]

/** Empty values always sort last, regardless of direction. */
function compare(a: Contact, b: Contact, key: SortKey) {
  const x = a[key]
  const y = b[key]
  if (x === y) return 0
  if (x == null) return 1
  if (y == null) return -1
  return String(x).localeCompare(String(y), undefined, { sensitivity: 'base' })
}

function LinkValue({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={`https://${href}`} target="_blank" rel="noreferrer"
      className="focus-visible:ring-ring/50 text-content-secondary inline-flex min-w-0 items-center gap-1 rounded-sm outline-none hover:underline focus-visible:ring-[3px]">
      <span className="truncate">{children}</span>
      <ExternalLinkIcon className="text-content-quaternary shrink-0" />
    </a>
  )
}

/** Footer statistic: dark value, muted label. */
function Stat({ value, label }: { value: React.ReactNode; label: string }) {
  return (
    <span>
      <span className="text-content-primary font-medium tabular-nums">{value}</span>{' '}
      <span className="text-content-tertiary">{label}</span>
    </span>
  )
}

export function DataTable({ query = '' }: { query?: string }) {
  const { config } = useTableConfig()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDirection } | null>(null)

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = q
      ? contacts.filter((c) =>
          SEARCHABLE.some((k) => String(c[k] ?? '').toLowerCase().includes(q)))
      : contacts
    if (!sort) return filtered
    const factor = sort.dir === 'asc' ? 1 : -1
    return [...filtered].sort((a, b) => compare(a, b, sort.key) * factor)
  }, [query, sort])

  const allSelected = rows.length > 0 && rows.every((r) => selected.has(r.id))
  const someSelected = !allSelected && rows.some((r) => selected.has(r.id))

  function toggleSort(key: SortKey) {
    setSort((current) => {
      if (current?.key !== key) return { key, dir: 'asc' }
      return current.dir === 'asc' ? { key, dir: 'desc' } : null
    })
  }

  function toggleRow(id: string) {
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAll() {
    setSelected((current) => {
      const next = new Set(current)
      if (allSelected) rows.forEach((r) => next.delete(r.id))
      else rows.forEach((r) => next.add(r.id))
      return next
    })
  }

  const { showRowNumber: showNumber, showCheckbox } = config
  /* Both on = number that yields to the checkbox on hover or selection. */
  const swaps = showNumber && showCheckbox

  return (
    /* `border-separate` + zero spacing keeps per-cell borders while allowing
       position: sticky, which `border-collapse: collapse` breaks. */
    <table
      data-motion={config.motion ? 'on' : 'off'}
      className="w-full table-fixed border-separate border-spacing-0"
      style={{ minWidth: TABLE_MIN_WIDTH }}
    >
      <caption className="sr-only">
        Contacts in the My Contacts list. {rows.length} of {contacts.length} rows shown, sortable by column.
      </caption>

      <colgroup>
        {COLUMNS.map((c) => (
          <col key={c.id} style={c.flex ? undefined : { width: c.width }} />
        ))}
      </colgroup>

      <thead>
        <tr>
          <HeaderCell colId="select" sticky="left" stickyOffset="0px" className="px-0">
            {/* pl-4 matches the px-4 used by the breadcrumb, tab strip and
                toolbar, so the whole left edge of the panel lines up. */}
            <div className="flex w-full items-center pl-4">
              {showCheckbox ? (
                <Checkbox checked={allSelected} indeterminate={someSelected} onChange={toggleAll}
                  label={allSelected ? 'Deselect all contacts' : 'Select all contacts'} />
              ) : (
                <span className="text-content-quaternary text-xs">#</span>
              )}
            </div>
          </HeaderCell>

          {COLUMNS.slice(1, -1).map((c) => (
            <HeaderCell key={c.id} colId={c.id}
              sticky={c.id === 'name' ? 'left' : undefined}
              stickyOffset={c.id === 'name' ? NAME_STICKY_LEFT : undefined}
              onSort={c.sortKey ? () => toggleSort(c.sortKey!) : undefined}
              sortDirection={sort && sort.key === c.sortKey ? sort.dir : null}>
              {c.label}
            </HeaderCell>
          ))}

          <HeaderCell colId="addColumn" sticky="right" stickyOffset="0px" className="border-l">
            <span className="flex w-full items-center justify-center">
              <PlusIcon className="text-content-tertiary" />
              <span className="sr-only">Add column</span>
            </span>
          </HeaderCell>
        </tr>
      </thead>

      {/* Re-keying on the sort remounts the rows, which replays the entrance
          stagger — a cheap way to show the reorder without a FLIP transform,
          which would break the sticky columns. */}
      <tbody key={sort ? `${sort.key}:${sort.dir}` : 'unsorted'}>
        {rows.length === 0 && (
          <tr>
            <td colSpan={COLUMNS.length}
              className="text-content-tertiary border-border-tertiary border-b px-4 py-10 text-center text-[13px]">
              No contacts match “{query}”.
            </td>
          </tr>
        )}

        {rows.map((row, index) => {
          const isSelected = selected.has(row.id)
          const cell = { rowId: row.id, selected: isSelected }
          return (
            <tr key={row.id} data-row-id={row.id} data-selected={isSelected || undefined}
              /* Capped so row 54 does not wait three quarters of a second. */
              style={{ '--row-i': Math.min(index, 16) } as CSSProperties}
              className={cn('group', config.striped && 'even:bg-overlay-secondary')}>
              <DataCell {...cell} colId="select" sticky="left" stickyOffset="0px" className="px-0">
                <div className="relative flex h-full w-full items-center pl-4">
                  {showNumber && (
                    <span className={cn(
                      'text-content-tertiary text-xs tabular-nums transition-opacity duration-150',
                      swaps && 'group-hover:opacity-0',
                      swaps && isSelected && 'opacity-0',
                    )}>
                      {index + 1}
                    </span>
                  )}
                  {showCheckbox && (
                    /* When both are on they occupy the same spot and crossfade,
                       so the swap reads as one control rather than two. */
                    <span className={cn(
                      swaps && 'absolute inset-y-0 left-4 flex items-center transition-opacity duration-150',
                      swaps && 'opacity-0 group-hover:opacity-100 focus-within:opacity-100',
                      swaps && isSelected && 'opacity-100',
                    )}>
                      <Checkbox checked={isSelected} onChange={() => toggleRow(row.id)}
                        label={`Select ${row.name}`} />
                    </span>
                  )}
                </div>
              </DataCell>

              <DataCell {...cell} colId="name" sticky="left" stickyOffset={NAME_STICKY_LEFT}>
                <div className="relative flex min-w-0 flex-1 items-center gap-2">
                  {/* No avatar — the design shows name + muted company only.
                      Both labels can shrink, so a long pair truncates as
                      "James Foulkstruthseek… K…" rather than one pushing the
                      other out of the cell. */}
                  <span className="text-content-primary min-w-0 truncate font-medium group-hover:underline">
                    {row.name}
                  </span>
                  <span className="text-content-tertiary min-w-0 truncate text-xs">
                    {row.companyLabel}
                  </span>

                  {/* Open-record affordance, revealed on row hover. LinkedIn
                      lives in its own column — it does not belong here. */}
                  {/* Absolute, not in flow: revealing it must not re-truncate
                      the name and company beside it. */}
                  <button
                    type="button"
                    aria-label={`Open ${row.name}`}
                    className={cn(
                      'border-border-tertiary bg-card text-content-tertiary hover:text-content-primary',
                      'hover:border-border focus-visible:ring-ring/50 flex size-[22px] shrink-0',
                      'cursor-pointer items-center justify-center rounded-[5px] border outline-none',
                      'focus-visible:ring-[3px]',
                      'pointer-events-none absolute top-1/2 right-0 -translate-y-1/2 opacity-0',
                      'transition-[opacity,transform] duration-150 ease-out',
                      'group-hover:pointer-events-auto group-hover:opacity-100',
                      'focus-visible:pointer-events-auto focus-visible:opacity-100',
                    )}
                  >
                    <OpenIcon />
                  </button>
                </div>
              </DataCell>

              <DataCell {...cell} colId="title">
                {row.title ? <TextValue>{row.title}</TextValue> : <EmptyValue />}
              </DataCell>

              <DataCell {...cell} colId="email">
                {row.email ? (
                  <a href={`mailto:${row.email}`}
                    className="focus-visible:ring-ring/50 truncate rounded-sm outline-none hover:underline focus-visible:ring-[3px]">
                    {row.email}
                  </a>
                ) : <EmptyValue />}
              </DataCell>

              <DataCell {...cell} colId="company_name">
                {row.companyName ? <TextValue>{row.companyName}</TextValue> : <EmptyValue />}
              </DataCell>

              <DataCell {...cell} colId="company_domain">
                {row.companyDomain ? (
                  <div className="relative flex w-full min-w-0 items-center gap-1.5">
                    <img alt="" aria-hidden="true" className="size-4 shrink-0 rounded object-contain"
                      src={faviconUrl(row.companyDomain)} />
                    <LinkValue href={row.companyDomain}>{row.companyDomain}</LinkValue>
                  </div>
                ) : <EmptyValue />}
              </DataCell>

              <DataCell {...cell} colId="linkedin_url">
                {row.linkedinUrl ? (
                  <a href={`https://${row.linkedinUrl}`} target="_blank" rel="noreferrer"
                    className="focus-visible:ring-ring/50 flex w-full min-w-0 items-center gap-1.5 rounded-sm outline-none hover:underline focus-visible:ring-[3px]">
                    <LinkedInBadge className="size-[18px]" />
                    <span className="truncate">{linkedinPath(row.linkedinUrl)}</span>
                  </a>
                ) : <EmptyValue />}
              </DataCell>

              <DataCell {...cell} colId="contact_2">
                <TextValue>{row.name}</TextValue>
              </DataCell>

              {/* chip and glyph are independent: either, both, or neither. */}
              <DataCell {...cell} colId={AI_COL}>
                <div className="relative flex w-full min-w-0 items-center gap-2">
                  {!row.department ? (
                    <EmptyValue />
                  ) : config.enrichTag ? (
                    <Tag tone="pending">
                      {config.enrichGlyph && <PlayCircleIcon className="shrink-0" />}
                      {row.department}
                    </Tag>
                  ) : (
                    <div className="text-content-disabled flex min-w-0 flex-1 items-center gap-x-2 text-xs">
                      {config.enrichGlyph && <PlayCircleIcon />}
                      <span className="truncate">{row.department}</span>
                    </div>
                  )}

                  {/* Re-run enrichment — revealed at the cell's right edge on hover. */}
                  {row.department && (
                    <button
                      type="button"
                      aria-label={`Re-run enrichment for ${row.name}`}
                      className={cn(
                      'border-border-tertiary bg-card text-content-tertiary hover:text-content-primary',
                      'hover:border-border focus-visible:ring-ring/50 flex size-[22px] shrink-0',
                      'cursor-pointer items-center justify-center rounded-[5px] border outline-none',
                      'focus-visible:ring-[3px]',
                      'pointer-events-none absolute top-1/2 right-0 -translate-y-1/2 opacity-0',
                      'transition-[opacity,transform] duration-150 ease-out',
                      'group-hover:pointer-events-auto group-hover:opacity-100',
                      'focus-visible:pointer-events-auto focus-visible:opacity-100',
                    )}
                    >
                      <RefreshIcon />
                    </button>
                  )}
                </div>
              </DataCell>

              {/* Trailing spacer: keeps the vertical separator, drops the row
                  rules so the column reads as blank rather than ruled. */}
              <DataCell {...cell} colId="addColumn" sticky="right" stickyOffset="0px"
                className="border-l border-b-0" />
            </tr>
          )
        })}
      </tbody>

      {config.showFooter && (
        <tfoot>
          <tr>
            <FooterCell colId="select" sticky="left" stickyOffset="0px" className="px-0">
              <span className="sr-only">Totals</span>
            </FooterCell>
            <FooterCell colId="name" sticky="left" stickyOffset={NAME_STICKY_LEFT}>
              <Stat value={rows.length} label="count" />
              {selected.size > 0 && (
                <span className="text-accent-select"> · {selected.size} selected</span>
              )}
            </FooterCell>
            <FooterCell colId="title">—</FooterCell>
            <FooterCell colId="email">
              <Stat value={rows.filter((c) => c.email).length} label="emails" />
            </FooterCell>
            <FooterCell colId="company_name">
              <Stat value={new Set(rows.map((c) => c.companyName)).size} label="companies" />
            </FooterCell>
            <FooterCell colId="company_domain">—</FooterCell>
            <FooterCell colId="linkedin_url">
              <Stat value={rows.filter((c) => c.linkedinUrl).length} label="links" />
            </FooterCell>
            <FooterCell colId="contact_2">—</FooterCell>
            <FooterCell colId={AI_COL}>
              <Stat
                value={`${rows.length ? Math.round((rows.filter((c) => c.department).length / rows.length) * 100) : 0}%`}
                label="ready"
              />
            </FooterCell>
            <FooterCell colId="addColumn" sticky="right" stickyOffset="0px" className="border-l" />
          </tr>
        </tfoot>
      )}
    </table>
  )
}
