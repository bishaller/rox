import { useCallback, useRef, useState } from 'react'
import { cn } from '@/lib/cn'
import { activeCount, FILTER_FIELDS, type Filter, type FilterJoin, type SortState } from '@/lib/filters'
import { ContextMenu } from './ContextMenu'
import { FilterPanel } from './FilterPanel'
import { type Anchor } from './overlay'
import { ArrowUpArrowDownIcon, FunnelIcon, SearchIcon } from './icons'

/* Filter and Sort are icon-only in the frame — 32 high, no border, no label,
   no elevation. Only the top bar's Add Contact is raised. */
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

export type ToolbarProps = {
  query: string
  onQueryChange: (value: string) => void
  filters: Filter[]
  onFiltersChange: (next: Filter[]) => void
  sort: SortState | null
  onSortChange: (next: SortState | null) => void
  join: FilterJoin
  onJoinChange: (next: FilterJoin) => void
  /** Rows the current filters leave visible — the panel's footer count. */
  resultCount: number
}

export function Toolbar({
  query, onQueryChange, filters, onFiltersChange, sort, onSortChange,
  join, onJoinChange, resultCount,
}: ToolbarProps) {
  const filterButton = useRef<HTMLButtonElement>(null)
  const sortButton = useRef<HTMLButtonElement>(null)
  const [filterAnchor, setFilterAnchor] = useState<Anchor | null>(null)
  const [sortAnchor, setSortAnchor] = useState<Anchor | null>(null)
  const active = activeCount(filters)

  const closeSort = useCallback(() => setSortAnchor(null), [])

  /* Stable, so the overlay's listeners are not torn down and re-registered on
     every keystroke in the panel. */
  const closeFilters = useCallback(() => setFilterAnchor(null), [])

  function openFilters() {
    const el = filterButton.current
    if (!el) return
    const r = el.getBoundingClientRect()
    setFilterAnchor({ x: r.left, y: r.bottom + 6 })
  }

  return (
    /* Search first, then the two glyphs — the frame puts the whole toolbar on
       the right of the tab row rather than splitting it across the strip. */
    /* Frame 3762:5845: 12px between the search box and the glyph pair, and the
       two glyphs adjacent. */
    <div className="flex shrink-0 items-center gap-3">
      <div data-slot="input-group"
        className="focus-within:border-ring flex h-[32px] w-[289px] items-center gap-1.5 rounded-[8px] border border-stone-200 bg-white px-2">
        <SearchIcon className="size-4 shrink-0 text-stone-400" />
        <input
          data-slot="input-group-control"
          type="search"
          aria-label="Search contacts"
          placeholder="Search contacts..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="text-ink min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-stone-400 [&::-webkit-search-cancel-button]:hidden"
        />
        {query && (
          <button type="button" onClick={() => onQueryChange('')} aria-label="Clear search"
            className="shrink-0 cursor-pointer text-stone-400 hover:text-stone-800">
            <ClearIcon />
          </button>
        )}
      </div>

      <div className="flex shrink-0 items-center">
        <button
          ref={filterButton}
          type="button"
          aria-haspopup="dialog"
          aria-expanded={filterAnchor !== null}
          /* The label went with the icon-only treatment, so the count has to
             ride here — the dot alone would not reach assistive tech. */
          aria-label={active > 0 ? `Filter, ${active} active` : 'Filter'}
          onClick={() => (filterAnchor ? closeFilters() : openFilters())}
          className={cn(ICON_CONTROL, filterAnchor && 'bg-stone-200 text-stone-800 hover:bg-stone-200')}
        >
          <FunnelIcon className="size-4" />
          {/* The count rides the button's corner as its own chip — the label
              went with the icon-only treatment, and a bare dot said "some"
              where the old pill said how many. */}
          {active > 0 && (
            <span aria-hidden="true"
              className="motion-safe:animate-check-in absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-stone-800 px-1 text-[10px] leading-none font-medium text-white tabular-nums">
              {active}
            </span>
          )}
        </button>

        <button
          ref={sortButton}
          type="button"
          aria-haspopup="menu"
          aria-expanded={sortAnchor !== null}
          aria-label={sort
            ? `Sort, by ${FILTER_FIELDS.find((f) => f.key === sort.key)?.label} ${sort.dir === 'asc' ? 'ascending' : 'descending'}`
            : 'Sort'}
          onClick={() => {
            if (sortAnchor) return closeSort()
            const r = sortButton.current?.getBoundingClientRect()
            if (r) setSortAnchor({ x: r.left, y: r.bottom + 6 })
          }}
          className={cn(ICON_CONTROL, (sortAnchor || sort) && 'bg-stone-200 text-stone-800 hover:bg-stone-200')}
        >
          <ArrowUpArrowDownIcon className="size-4" />
        </button>
      </div>

      {sortAnchor && (
        <ContextMenu
          anchor={sortAnchor}
          onClose={closeSort}
          items={FILTER_FIELDS.map(({ key, label }) => ({
            /* The active field carries its direction; clicking cycles it the
               same way the column header does: asc → desc → off. */
            label: sort?.key === key ? `${label} ${sort.dir === 'asc' ? '↑' : '↓'}` : label,
            onSelect: () => {
              if (sort?.key !== key) return onSortChange({ key, dir: 'asc' })
              onSortChange(sort.dir === 'asc' ? { key, dir: 'desc' } : null)
            },
          }))}
        />
      )}

      {filterAnchor && (
        <FilterPanel
          resultCount={resultCount}
          join={join}
          onJoinChange={onJoinChange}
          anchor={filterAnchor}
          filters={filters}
          onChange={onFiltersChange}
          onClose={closeFilters}
          trigger={filterButton}
        />
      )}
    </div>
  )
}
