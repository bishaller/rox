import { cn } from '@/lib/cn'
import {
  ChevronDownIcon, FilterIcon, PlusCircleIcon, SearchIcon, SortIcon, StackIcon,
} from './icons'

/* All controls are 32 high and border-only — the design carries no elevation
   on the toolbar; only the top bar's Add Contact is raised. */
const CONTROL =
  'flex h-[32px] shrink-0 cursor-pointer items-center gap-2 rounded-lg px-3 ' +
  'text-[14px] whitespace-nowrap transition-colors outline-none ' +
  'focus-visible:ring-ring/50 focus-visible:ring-[3px]'

const BORDERED = 'border-button-border text-content-primary hover:bg-os-gray-100 border bg-white'
const PLAIN = 'text-content-primary hover:bg-os-gray-100'

function ClearIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="size-3.5">
      <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function DashedCircle() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="size-3.5 shrink-0">
      <circle cx="8" cy="8" r="6.1" stroke="currentColor" strokeWidth="1.4" strokeDasharray="3.4 2.8" />
    </svg>
  )
}

export type ToolbarProps = {
  query: string
  onQueryChange: (value: string) => void
}

export function Toolbar({ query, onQueryChange }: ToolbarProps) {
  return (
    <div className="flex shrink-0 items-center gap-2 px-4">
      {/* Left — scope and ordering */}
      <button type="button" className={cn(CONTROL, BORDERED)}>
        <StackIcon className="text-content-tertiary" />
        In CRM
        <ChevronDownIcon className="text-content-tertiary" />
      </button>

      <button type="button" className={cn(CONTROL, BORDERED)}>
        <DashedCircle />
        All Accounts
        <ChevronDownIcon className="text-content-tertiary" />
      </button>

      <button type="button" className={cn(CONTROL, PLAIN)}>
        <FilterIcon className="text-content-tertiary" />
        Filter
      </button>

      <button type="button" className={cn(CONTROL, PLAIN)}>
        <SortIcon className="text-content-tertiary" />
        Sort
      </button>

      {/* Right — search and column management */}
      <div className="ml-auto flex shrink-0 items-center gap-2">
        <div data-slot="input-group"
          className="border-button-border focus-within:border-ring flex h-[32px] w-[305px] items-center gap-2 rounded-lg border bg-white px-3">
          <SearchIcon className="text-content-placeholder size-3.5 shrink-0" />
          <input
            data-slot="input-group-control"
            type="search"
            aria-label="Search contacts"
            placeholder="Search..."
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            className="text-content-primary placeholder:text-content-placeholder min-w-0 flex-1 bg-transparent text-[14px] outline-none [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button type="button" onClick={() => onQueryChange('')} aria-label="Clear search"
              className="text-content-tertiary hover:text-content-primary shrink-0 cursor-pointer">
              <ClearIcon />
            </button>
          )}
        </div>

        <button type="button" className={cn(CONTROL, BORDERED)}>
          <PlusCircleIcon className="text-content-tertiary" />
          Add Column
        </button>
      </div>
    </div>
  )
}
