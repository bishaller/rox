import { type CSSProperties, useEffect, useMemo, useRef, useState } from 'react'
import { type Contact, contacts } from '@/data/contacts'
import { Checkbox } from '@/components/ui/checkbox'
import { Favicon } from './Favicon'
import { Tag } from '@/components/ui/tag'
import { cn } from '@/lib/cn'
import { type Filter, type FilterJoin, type SortState } from '@/lib/filters'
import { deriveRows } from '@/lib/deriveRows'
import { useTableConfig } from '@/dev/tableConfig'
import {
  DataCell, EmptyValue, FooterCell, HeaderCell, TextValue,
} from './DataCell'
import {
  ExternalLinkIcon, LinkedInBadge, PlayCircleIcon, PlusCircleIcon, RefreshIcon,
} from './icons'
import type { Anchor } from './overlay'
import type { EnrichPhase } from './enrichment/useEnrichmentFlow'
import {
  type EnrichResult, type EnrichmentDef, ENRICH_COL_WIDTH, FIELD_COL_WIDTH,
} from '@/data/enrichments'

const AI_COL = 'categorize_the_people_from_the_kind_of_work_they_d'

/** Sortable columns are exactly the filterable fields. */
type SortKey = SortState['key']

/**
 * Widths read off the Figma frame (node 3762:5140 — header 3762:5209, row
 * 3762:5235): 230 · 130 · 215 · 210 · 149 · 225 · 247 · 98 — 1504 in total.
 *
 * There is no select gutter any more: the checkbox sits inside the Contact
 * cell, and Company has moved up to sit directly beside it.
 *
 * The frame's trailing 98 plus the right end of Department are covered by a
 * floating 119px Add-column rail. We give that rail its own column instead, so
 * it never sits on top of a header it has to hide — Department absorbs the
 * remainder, which lands it at the 226 the frame leaves once the rail is
 * subtracted.
 *
 * The earlier capture's duplicate `Contact` column is gone from this frame, and
 * Linkedin roughly doubles to carry the full profile path.
 */
const COLUMNS: { id: string; label: string; width: number; sortKey?: SortKey; flex?: boolean }[] = [
  { id: 'name', label: 'Contact', width: 230, sortKey: 'name' },
  { id: 'company_name', label: 'Company', width: 130, sortKey: 'companyName' },
  { id: 'title', label: 'Title', width: 215, sortKey: 'title' },
  { id: 'email', label: 'Email', width: 210, sortKey: 'email' },
  { id: 'company_domain', label: 'Domain', width: 149, sortKey: 'companyDomain' },
  { id: 'linkedin_url', label: 'Linkedin', width: 225, sortKey: 'linkedinUrl' },
  // `flex` marks the column that absorbs any width beyond the design total.
  { id: AI_COL, label: 'Department / Work Category', width: 226, sortKey: 'department', flex: true },
  { id: 'addColumn', label: '', width: 119 },
]

/** The design shows only the path portion, e.g. `/deepalidsfd…`. */
function linkedinPath(url: string) {
  return url.replace(/^.*linkedin\.com\/in/i, '') || url
}

function LinkValue({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={`https://${href}`} target="_blank" rel="noreferrer"
      className="focus-visible:ring-ring/50 inline-flex min-w-0 items-center gap-1 rounded-sm outline-none hover:underline focus-visible:ring-[3px]">
      <span className="overflow-hidden text-clip">{children}</span>
      {/* The open-in-new glyph only surfaces when the row is under the cursor
          (or the link focused) — at rest the column is just domains. */}
      <ExternalLinkIcon className={cn(
        'text-content-quaternary shrink-0 opacity-0 transition-opacity duration-150',
        'group-hover:opacity-100 group-focus-within/cell:opacity-100',
      )} />
    </a>
  )
}

/**
 * The enrichment trigger — `Enrich` in an un-enriched cell, `Enrich All` in the
 * footer. 25px tall with a hairline border and the faintest lift, exactly as in
 * the frame; the play glyph is on the `enrichGlyph` switch.
 */
function RunButton({
  label, onClick, disabled,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
}) {
  const { config } = useTableConfig()

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'border-line-strong shadow-raised flex h-[25px] shrink-0 cursor-pointer',
        'items-center gap-1.5 rounded-[8px] border bg-white pr-[7px] pl-1.5',
        'text-[14px] font-medium whitespace-nowrap text-stone-800',
        'transition-[background-color,transform] duration-150 ease-out-strong outline-none',
        'not-disabled:active:scale-[0.97]',
        'hover:bg-stone-50 focus-visible:ring-ring/50 focus-visible:ring-[3px]',
        'disabled:cursor-default disabled:opacity-55 disabled:hover:bg-white',
      )}
    >
      {/* stone-400, read off the frame's exported `circle-play` (#a6a09b) —
          a step lighter than the label beside it, not the same weight. */}
      {config.enrichGlyph && <PlayCircleIcon className="size-4 shrink-0 text-stone-400" />}
      {label}
    </button>
  )
}

/** The categories the mock enrichment can return. */
const CATEGORIES = ['Sales', 'Engineering', 'Finance', 'Product', 'Operations', 'Marketing']

/**
 * Stands in for the real enrichment call. Derived from the row id so a given
 * contact always resolves to the same category — re-running never shuffles the
 * column, which would read as a bug rather than a refresh.
 */
function categorize(id: string) {
  let h = 0
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return CATEGORIES[h % CATEGORIES.length]
}

/* ─────────────────────── enrichment-flow column ───────────────────────── */

/* Opaque on purpose — these cells are (or sit beside) sticky ones, and an
   alpha background would let scrolled content ghost through. Stated twice so
   the hover variant beats HeaderCell's own `hover:bg-stone-50` in the merge. */
const ENRICH_TINT = 'bg-enrich-surface hover:bg-enrich-surface text-indigo-800'

function TrialBadge() {
  return (
    <span className="shrink-0 rounded-[4px] bg-indigo-100 px-[5px] py-px text-[10px] font-semibold tracking-[0.05em] text-indigo-800">
      TRIAL
    </span>
  )
}

/** A value still in flight. Static under reduced motion — absence, not noise. */
function Skeleton() {
  return (
    <span
      aria-hidden="true"
      className="motion-safe:animate-shimmer inline-block h-[9px] w-[62%] rounded-[4px]"
      style={{
        background:
          'linear-gradient(90deg, var(--color-stone-100), var(--color-stone-200), var(--color-stone-100))',
        backgroundSize: '200% 100%',
      }}
    />
  )
}

/** Which provider a value came from — stone-quiet next to the value. */
function SourceChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="border-line shrink-0 rounded-[5px] border px-[5px] text-[10.5px] leading-4 text-stone-400">
      {children}
    </span>
  )
}

/**
 * The enrichment column's cell plus one cell per extracted field. Scope is
 * membership by id, not index — filtering mid-trial cannot detach a result
 * from its row.
 */
function EnrichCells({
  cell, row, enrichment,
}: {
  cell: { rowId: string; selected: boolean }
  row: Contact
  enrichment: EnrichmentTableState
}) {
  const { phase, trialIds, revealed, addedFields, resultFor } = enrichment
  const trialIdx = trialIds.indexOf(row.id)
  const inScope = phase === 'ran' || trialIdx !== -1
  const pending = phase === 'trial-running' && trialIdx !== -1 && trialIdx >= revealed
  const res = inScope && !pending ? resultFor(row) : null

  return (
    <>
      <DataCell {...cell} colId="enrich" className="bg-enrich-surface">
        {!inScope ? (
          <EmptyValue />
        ) : pending ? (
          <Skeleton />
        ) : res ? (
          /* The provider chip is trial-time evidence — once the run is
             committed the column is just data, so the label goes. */
          <span className="motion-safe:animate-value-in flex w-full min-w-0 items-center gap-[7px]">
            <TextValue>{res.value}</TextValue>
            {phase !== 'ran' && <SourceChip>{res.source}</SourceChip>}
          </span>
        ) : (
          <span className="text-content-tertiary text-[12.5px] italic">no match</span>
        )}
      </DataCell>

      {addedFields.map((k) => (
        <DataCell {...cell} key={k} colId={`enrichfield:${k}`} className="bg-enrich-surface">
          {res?.fields[k] ? (
            <span className="motion-safe:animate-value-in flex min-w-0">
              <TextValue>{res.fields[k]}</TextValue>
            </span>
          ) : (
            <EmptyValue />
          )}
        </DataCell>
      ))}
    </>
  )
}

/** Footer statistic: dark value, muted label. */
function Stat({ value, label }: { value: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 align-middle">
      <span className="text-ink text-[14px] font-medium tabular-nums">{value}</span>
      <span className="text-[13px] text-stone-400">{label}</span>
    </span>
  )
}

/**
 * What the table needs to render an active enrichment: the column, its trial
 * progress, and the extracted field columns. Owned by the page's
 * `useEnrichmentFlow`; null (or absent) means no enrichment column.
 */
export type EnrichmentTableState = {
  phase: EnrichPhase
  def: EnrichmentDef
  trialIds: string[]
  revealed: number
  addedFields: string[]
  resultFor: (c: Contact) => EnrichResult | null
  onHeaderMenu: (anchor: Anchor) => void
}

export type DataTableProps = {
  query?: string
  filters?: Filter[]
  /** Controlled: the page owns sort, so the toolbar and saved views set it too. */
  sort?: SortState | null
  onSortChange?: (next: SortState | null) => void
  filterJoin?: FilterJoin
  /** Opens the Add-column popover, anchored under the button. */
  onAddColumn?: (anchor: Anchor) => void
  enrichment?: EnrichmentTableState | null
}

/** The Add-column popover's width — the anchor right-aligns it to the rail. */
const ADD_POPOVER_WIDTH = 372

export function DataTable({
  query = '', filters = [], sort = null, onSortChange, filterJoin = 'and',
  onAddColumn, enrichment = null,
}: DataTableProps) {
  const { config } = useTableConfig()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const tableRef = useRef<HTMLTableElement>(null)

  /* Enrichment results layered over the seed data, so `contacts` stays the
     as-designed starting state and a reload returns to it. */
  const [enriched, setEnriched] = useState<Record<string, string>>({})
  const [running, setRunning] = useState<Set<string>>(new Set())
  /* Cleared on unmount so a pending run cannot set state on a dead tree. */
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const rows = useMemo(() => {
    const base = contacts.map((c) =>
      enriched[c.id] ? { ...c, department: enriched[c.id] } : c)
    return deriveRows(base, { query, filters, sort, join: filterJoin })
  }, [query, sort, enriched, filters, filterJoin])

  /* The enrichment column and its extracted fields splice in between the AI
     column and the Add-column rail. Ids are stable so the <col> keys hold. */
  const columns = useMemo<typeof COLUMNS>(() => {
    if (!enrichment) return COLUMNS
    const extra = [
      { id: 'enrich', label: enrichment.def.columnLabel, width: ENRICH_COL_WIDTH },
      ...enrichment.addedFields.map((k) => ({
        id: `enrichfield:${k}`,
        label: enrichment.def.fields.find((f) => f.key === k)?.label ?? k,
        width: FIELD_COL_WIDTH,
      })),
    ]
    return [...COLUMNS.slice(0, -1), ...extra, COLUMNS[COLUMNS.length - 1]]
  }, [enrichment])

  const minWidth = useMemo(() => columns.reduce((n, c) => n + c.width, 0), [columns])

  /* When an enrichment column (or a pulled-out field column) lands beyond
     the right edge, bring it into view — data filling in off-screen reads as
     nothing happening. Scrolls right only; never yanks the user back. */
  const enrichColId = enrichment?.def.id ?? null
  const enrichColCount = enrichment ? 1 + enrichment.addedFields.length : 0
  useEffect(() => {
    if (!enrichColId) return
    const table = tableRef.current
    const scroller = table?.parentElement
    if (!table || !scroller) return
    const cells = table.querySelectorAll<HTMLElement>('thead th[data-col-id^="enrich"]')
    const last = cells[cells.length - 1]
    if (!last) return
    /* The sticky Add-column rail covers the scrollport's right edge, so the
       column must clear it, not just the edge. */
    const rail = COLUMNS[COLUMNS.length - 1].width
    const target = last.offsetLeft + last.offsetWidth - (scroller.clientWidth - rail) + 8
    if (target > scroller.scrollLeft) {
      const smooth = config.motion &&
        !window.matchMedia('(prefers-reduced-motion: reduce)').matches
      scroller.scrollTo({ left: target, behavior: smooth ? 'smooth' : 'auto' })
    }
  }, [enrichColId, enrichColCount, config.motion])

  /**
   * Mock enrichment. `stagger` spaces a Run All out so the column fills in
   * visibly rather than snapping all at once.
   */
  function run(ids: string[]) {
    const pending = ids.filter((id) => !running.has(id))
    if (pending.length === 0) return
    setRunning((current) => new Set([...current, ...pending]))

    pending.forEach((id, i) => {
      const t = setTimeout(() => {
        setEnriched((current) => ({ ...current, [id]: categorize(id) }))
        setRunning((current) => {
          const next = new Set(current)
          next.delete(id)
          return next
        })
      }, 450 + i * 90)
      timers.current.push(t)
    })
  }

  /** Rows the footer's Run All would act on. */
  const unenriched = rows.filter((r) => !r.department).map((r) => r.id)

  /* Footer stat for the enrichment column — only rows whose value has
     actually landed count, so the number climbs with the trial. */
  const enrichMatched = enrichment
    ? rows.filter((r) => {
        const idx = enrichment.trialIds.indexOf(r.id)
        const landed = enrichment.phase === 'ran' || (idx !== -1 && idx < enrichment.revealed)
        return landed && enrichment.resultFor(r) !== null
      }).length
    : 0

  const visibleSelected = rows.filter((r) => selected.has(r.id)).length
  const allSelected = rows.length > 0 && visibleSelected === rows.length
  const someSelected = !allSelected && visibleSelected > 0

  function toggleSort(key: SortKey) {
    if (sort?.key !== key) return onSortChange?.({ key, dir: 'asc' })
    onSortChange?.(sort.dir === 'asc' ? { key, dir: 'desc' } : null)
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

  return (
    /* `border-separate` + zero spacing keeps per-cell borders while allowing
       position: sticky, which `border-collapse: collapse` breaks. */
    <table
      ref={tableRef}
      data-motion={config.motion ? 'on' : 'off'}
      className="w-full table-fixed border-separate border-spacing-0"
      style={{ minWidth }}
    >
      <caption className="sr-only">
        Contacts in the My Contacts list. {rows.length} of {contacts.length} rows shown, sortable by column.
      </caption>

      <colgroup>
        {columns.map((c) => (
          <col key={c.id} style={c.flex ? undefined : { width: c.width }} />
        ))}
      </colgroup>

      <thead>
        <tr>
          {/* Select-all rides in the Contact header, `leading` so it stays
              outside the sort button rather than nested inside it. */}
          <HeaderCell
            colId="name"
            sticky="left"
            stickyOffset="0px"
            className="pl-4"
            onSort={() => toggleSort('name')}
            sortDirection={sort && sort.key === 'name' ? sort.dir : null}
            leading={showCheckbox ? (
              <Checkbox checked={allSelected} indeterminate={someSelected} onChange={toggleAll}
                label={allSelected ? 'Deselect all contacts' : 'Select all contacts'} />
            ) : undefined}
          >
            Contact
          </HeaderCell>

          {columns.slice(1, -1).map((c) => {
            if (enrichment && c.id === 'enrich') {
              return (
                <HeaderCell key={c.id} colId={c.id}
                  className={ENRICH_TINT}
                  onMenu={enrichment.onHeaderMenu}
                  menuLabel={`${enrichment.def.columnLabel} column options`}
                  badge={enrichment.phase !== 'ran' ? <TrialBadge /> : undefined}>
                  {c.label}
                </HeaderCell>
              )
            }
            if (c.id.startsWith('enrichfield:')) {
              return (
                <HeaderCell key={c.id} colId={c.id} className={ENRICH_TINT}>
                  {c.label}
                </HeaderCell>
              )
            }
            const sortKey = c.sortKey
            return (
              <HeaderCell key={c.id} colId={c.id}
                onSort={sortKey ? () => toggleSort(sortKey) : undefined}
                sortDirection={sort && sort.key === sortKey ? sort.dir : null}>
                {c.label}
              </HeaderCell>
            )
          })}

          {/* The design labels this rather than showing a bare glyph, and pins
              it to the right edge so it survives horizontal scrolling. */}
          <HeaderCell colId="addColumn" sticky="right" stickyOffset="0px"
            className="border-l border-stone-200 px-0">
            <span className="flex w-full items-center px-1">
              <button
                type="button"
                onClick={(e) => {
                  const r = e.currentTarget.getBoundingClientRect()
                  /* Right-align the popover to the rail; the overlay hook
                     clamps it back into the viewport when that overshoots. */
                  onAddColumn?.({ x: r.right - ADD_POPOVER_WIDTH, y: r.bottom + 6 })
                }}
                className={cn(
                  'focus-visible:ring-ring/50 flex h-[30px] w-full cursor-pointer items-center',
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

      {/* Re-keying on the sort remounts the rows, which replays the entrance
          stagger — a cheap way to show the reorder without a FLIP transform,
          which would break the sticky columns. */}
      <tbody
        key={sort ? `${sort.key}:${sort.dir}` : 'unsorted'}
        /* The footer draws its own top rule, so the last row keeping its
           bottom one painted two hairlines back to back — a visibly heavier
           line above the calculation row than between any two rows. */
        className={cn(config.showFooter && '[&>tr:last-child>td]:border-b-0')}
      >
        {rows.length === 0 && (
          <tr>
            <td colSpan={columns.length}
              className="text-content-tertiary border-border-tertiary border-b px-4 py-10 text-center text-[13px]">
              {query ? <>No contacts match “{query}”.</> : 'No contacts match these filters.'}
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
              {/* Contact: checkbox, then the name. No company label — Company
                  is its own column now — and no row number; the design dropped
                  the gutter entirely. The number is kept behind its dev switch
                  and rides here when on. */}
              <DataCell {...cell} colId="name" sticky="left" stickyOffset="0px" className="pl-4">
                {/* 16px pad + 16px box + 8px gap puts the name on 40. The pad
                    is 16 rather than the frame's 14 so the checkbox shares a
                    left edge with the first view tab and the breadcrumb. */}
                <div className="relative flex min-w-0 flex-1 items-center gap-2">
                  {showNumber && (
                    <span className="text-content-tertiary w-5 shrink-0 text-xs tabular-nums">
                      {index + 1}
                    </span>
                  )}
                  {showCheckbox && (
                    <Checkbox checked={isSelected} onChange={() => toggleRow(row.id)}
                      label={`Select ${row.name}`} />
                  )}

                  {/* The hover underline is drawn, not text-decoration — a
                      decoration can't animate, and this one rises 2px into
                      place. 100ms: it must read as the cursor's own doing. */}
                  <span className={cn(
                    'text-content-primary relative min-w-0 overflow-hidden font-medium text-clip',
                    'after:absolute after:inset-x-0 after:bottom-[2px] after:h-px after:bg-stone-400',
                    'after:translate-y-[2px] after:opacity-0',
                    'after:transition-[opacity,transform] after:duration-100 after:ease-out-strong',
                    'group-hover:after:translate-y-0 group-hover:after:opacity-100',
                  )}>
                    {row.name}
                  </span>

                </div>
              </DataCell>

              <DataCell {...cell} colId="company_name">
                {row.companyName ? <TextValue>{row.companyName}</TextValue> : <EmptyValue />}
              </DataCell>

              <DataCell {...cell} colId="title">
                {row.title ? <TextValue>{row.title}</TextValue> : <EmptyValue />}
              </DataCell>

              <DataCell {...cell} colId="email">
                {row.email ? (
                  <a href={`mailto:${row.email}`}
                    className="focus-visible:ring-ring/50 overflow-hidden text-clip rounded-sm outline-none hover:underline focus-visible:ring-[3px]">
                    {row.email}
                  </a>
                ) : <EmptyValue />}
              </DataCell>

              <DataCell {...cell} colId="company_domain">
                {row.companyDomain ? (
                  <div className="relative flex w-full min-w-0 items-center gap-[9px]">
                    <Favicon domain={row.companyDomain} />
                    <LinkValue href={row.companyDomain}>{row.companyDomain}</LinkValue>
                  </div>
                ) : <EmptyValue />}
              </DataCell>

              <DataCell {...cell} colId="linkedin_url">
                {row.linkedinUrl ? (
                  <a href={`https://${row.linkedinUrl}`} target="_blank" rel="noreferrer"
                    className="focus-visible:ring-ring/50 flex w-full min-w-0 items-center gap-1 rounded-sm text-stone-600 outline-none hover:underline focus-visible:ring-[3px]">
                    <LinkedInBadge className="size-4" />
                    <span className="overflow-hidden text-clip">{linkedinPath(row.linkedinUrl)}</span>
                  </a>
                ) : <EmptyValue />}
              </DataCell>

              {/* Three states, as in the design: a value once enrichment has
                  run, a Run button when it has not, and a pending chip while
                  it is in flight. `enrichTag` picks chip vs plain text for the
                  value; `enrichGlyph` puts the play glyph in the Run button. */}
              <DataCell {...cell} colId={AI_COL}>
                <div className="relative flex w-full min-w-0 items-center gap-2">
                  {running.has(row.id) ? (
                    <span className="motion-safe:animate-value-in flex min-w-0">
                      <Tag tone="pending" pulse>Running…</Tag>
                    </span>
                  ) : !row.department ? (
                    /* The frame leaves an un-enriched Department blank until
                       the row is hovered, then reveals the chip — the same
                       pattern as the open-record and re-run buttons below.
                       Opacity only: laying it out on hover would shift the
                       cell's contents. */
                    <span className={cn(
                      'shrink-0 pointer-events-none opacity-0 transition-opacity duration-150 ease-out',
                      'group-hover:pointer-events-auto group-hover:opacity-100',
                      'focus-within:pointer-events-auto focus-within:opacity-100',
                    )}>
                      <RunButton label="Enrich" onClick={() => run([row.id])} />
                    </span>
                  ) : config.enrichTag ? (
                    /* The rise is for values that just landed. Rows that were
                       seeded enriched already animate with the row — running
                       it again there would double the motion. */
                    <span className={cn('flex min-w-0',
                      enriched[row.id] && 'motion-safe:animate-value-in')}>
                      <Tag tone="done">{row.department}</Tag>
                    </span>
                  ) : (
                    <span className={cn('min-w-0 flex-1 overflow-hidden text-clip',
                      enriched[row.id] && 'motion-safe:animate-value-in')}>
                      {row.department}
                    </span>
                  )}

                  {/* Re-run enrichment — revealed at the cell's right edge on hover. */}
                  {row.department && !running.has(row.id) && (
                    <button
                      type="button"
                      onClick={() => run([row.id])}
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

              {enrichment && <EnrichCells cell={cell} row={row} enrichment={enrichment} />}

              {/* Trailing spacer: keeps the vertical separator, drops the row
                  rules so the column reads as blank rather than ruled. */}
              <DataCell {...cell} colId="addColumn" sticky="right" stickyOffset="0px"
                className="border-l border-b-0 border-stone-200 bg-white" />
            </tr>
          )
        })}
      </tbody>

      {config.showFooter && (
        <tfoot>
          <tr>
            {/* The design carries only two statistics — Names and Links — and
                leaves every other column as an em-dash. */}
            <FooterCell colId="name" sticky="left" stickyOffset="0px" className="pl-4">
              <Stat value={rows.length} label="Names" />
              {/* Selection outlives filtering, so a bare count sits next to a
                  smaller row count and reads as a contradiction. Say both when
                  they differ. */}
              {selected.size > 0 && (
                <span className="text-accent-select">
                  {' · '}
                  {visibleSelected === selected.size
                    ? `${selected.size} selected`
                    : `${visibleSelected} of ${selected.size} selected`}
                </span>
              )}
            </FooterCell>
            <FooterCell colId="company_name">—</FooterCell>
            <FooterCell colId="title">—</FooterCell>
            <FooterCell colId="email">—</FooterCell>
            <FooterCell colId="company_domain">—</FooterCell>
            <FooterCell colId="linkedin_url">
              <Stat value={rows.filter((c) => c.linkedinUrl).length} label="Links" />
            </FooterCell>
            <FooterCell colId={AI_COL} className="px-2">
              <RunButton
                label="Enrich All"
                onClick={() => run(unenriched)}
                disabled={unenriched.length === 0}
              />
            </FooterCell>
            {enrichment && (
              <>
                <FooterCell colId="enrich" className="bg-enrich-surface">
                  <Stat value={enrichMatched} label="Matched" />
                </FooterCell>
                {enrichment.addedFields.map((k) => (
                  <FooterCell key={k} colId={`enrichfield:${k}`} className="bg-enrich-surface">
                    —
                  </FooterCell>
                ))}
              </>
            )}
            <FooterCell colId="addColumn" sticky="right" stickyOffset="0px"
              className="border-l border-stone-200 bg-white" />
          </tr>
        </tfoot>
      )}
    </table>
  )
}
