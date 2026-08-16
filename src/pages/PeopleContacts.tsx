import { useState } from 'react'
import { cn } from '@/lib/cn'
import { useTableConfig } from '@/dev/tableConfig'
import { Sidebar } from '@/components/rox/Sidebar'
import { TopBar } from '@/components/rox/TopBar'
import { Toolbar } from '@/components/rox/Toolbar'
import { ViewTabs } from '@/components/rox/ViewTabs'
import { DataTable } from '@/components/rox/DataTable'

export function PeopleContacts({ onNavigate }: { onNavigate?: (page: string) => void }) {
  /* Lifted so the Toolbar's search box and the table share one source of truth. */
  const [query, setQuery] = useState('')
  const { config } = useTableConfig()
  const boxed = config.boxed

  return (
    <div className="bg-app-bg flex h-full w-full overflow-hidden">
      <Sidebar active="People" onNavigate={onNavigate} />

      {/* Main panel — rounded card floating on the app background, as in the app. */}
      <div className="flex min-w-0 flex-1 flex-col py-3 pr-3">
        <div className="bg-card border-card-border shadow-main-panel flex min-h-0 flex-1 flex-col overflow-hidden rounded-[14px] border">
          <TopBar />

          {/* Measured from the design: tabs sit above the toolbar, with a
              consistent ~13px rhythm down to the grid. */}
          <div className="flex shrink-0 flex-col gap-3 pb-3">
            <ViewTabs />
            <Toolbar query={query} onQueryChange={setQuery} />
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
              <DataTable query={query} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
