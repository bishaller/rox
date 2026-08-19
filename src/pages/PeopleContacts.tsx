import { useState } from 'react'
import { cn } from '@/lib/cn'
import type { Filter, SortState } from '@/lib/filters'
import type { View } from '@/components/rox/ViewTabs'
import { useTableConfig } from '@/dev/tableConfig'
import { Sidebar } from '@/components/rox/Sidebar'
import { TopBar } from '@/components/rox/TopBar'
import { Toolbar } from '@/components/rox/Toolbar'
import { ViewTabs } from '@/components/rox/ViewTabs'
import { DataTable } from '@/components/rox/DataTable'
import { AddColumnModal } from '@/components/rox/AddColumnModal'

export function PeopleContacts({ onNavigate }: { onNavigate?: (page: string) => void }) {
  /* Lifted so the Toolbar's search box and the table share one source of truth. */
  const [query, setQuery] = useState('')
  /* Owned here rather than in the table: the dialog is a page-level overlay,
     and Accounts mounts the same component the same way. */
  const [addColumnOpen, setAddColumnOpen] = useState(false)
  /* Lifted for the same reason as `query`: the toolbar edits them, the table
     applies them. */
  const [filters, setFilters] = useState<Filter[]>([])
  /* Lifted out of the table so the toolbar's Sort menu and saved views can
     drive it, not only the column headers. */
  const [sort, setSort] = useState<SortState | null>(null)
  const { config } = useTableConfig()

  /* Selecting a view replaces the table's whole definition with the view's. */
  function applyView(view: View) {
    setFilters(view.filters ?? [])
    setQuery(view.query ?? '')
    setSort(view.sort ?? null)
  }
  const boxed = config.boxed

  return (
    <div className="bg-app-bg flex h-full w-full overflow-hidden">
      <Sidebar active="People" onNavigate={onNavigate} />

      {/* Main panel — rounded card floating on the app background, as in the app. */}
      <div className="flex min-w-0 flex-1 flex-col pt-4 pr-4 pb-3">
        <div className="bg-card border-card-border shadow-main-panel flex min-h-0 flex-1 flex-col overflow-hidden rounded-[14px] border">
          <TopBar />

          {/* One 48px band, per the frame: saved views on the left, search and
              the two glyph controls on the right. They used to stack as two
              rows with the filter/sort buttons pinned left. */}
          <div className="flex shrink-0 items-start justify-between gap-3 px-4 pt-4 pb-2">
            <ViewTabs filters={filters} query={query} sort={sort} onApply={applyView} />
            <Toolbar query={query} onQueryChange={setQuery}
              filters={filters} onFiltersChange={setFilters}
              sort={sort} onSortChange={setSort} />
          </div>

          {/* In `boxed`, this outer region only provides the gutter; the inner
              card is the scrollport, so sticky header/columns anchor to it. */}
          <div className={cn('flex min-h-0 flex-1 flex-col', boxed && 'overflow-hidden px-4 pb-4')}>
            <div
              tabIndex={0}
              aria-label="Contacts table. Scroll horizontally and vertically to view all columns and rows."
              className={cn(
                'focus-visible:ring-ring/50 min-h-0 flex-1 overflow-auto outline-none focus-visible:ring-2 focus-visible:ring-inset',
                boxed && 'border-border-tertiary rounded-lg border',
              )}
            >
              <DataTable query={query} filters={filters} sort={sort} onSortChange={setSort}
                onAddColumn={() => setAddColumnOpen(true)} />
            </div>
          </div>
        </div>
      </div>

      <AddColumnModal open={addColumnOpen} onClose={() => setAddColumnOpen(false)} />
    </div>
  )
}
