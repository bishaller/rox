import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Button } from '@/components/ui/button'
import { ChevronDownIcon } from './icons'

/**
 * A breadcrumb segment. Rests as bare text and picks up a grey pill on hover;
 * the parent crumb also darkens from muted to primary.
 */
function Crumb({
  children, current, hasMenu,
}: {
  children: ReactNode
  /** The crumb for the page you're on — always full contrast. */
  current?: boolean
  hasMenu?: boolean
}) {
  return (
    <button
      type="button"
      aria-current={current ? 'page' : undefined}
      aria-haspopup={hasMenu ? 'menu' : undefined}
      className={cn(
        'group flex h-[28px] cursor-pointer items-center gap-1 rounded-sm px-2 text-[15px] font-medium',
        'hover:bg-os-gray-100 focus-visible:ring-ring/50 outline-none transition-colors focus-visible:ring-[3px]',
        current
          ? 'text-content-primary'
          : 'text-content-tertiary hover:text-content-primary',
      )}
    >
      {children}
      {hasMenu && (
        <ChevronDownIcon className="text-content-tertiary group-hover:text-content-primary transition-colors" />
      )}
    </button>
  )
}

export function TopBar() {
  return (
    /* No bottom rule and a white ground — the panel reads as one continuous
       surface from the breadcrumb down to the grid. */
    <header className="bg-card flex h-[70px] shrink-0 items-center justify-between px-4">
      {/* -ml-2 cancels the crumb's own padding so the text still starts on the
          container's left edge. */}
      <nav aria-label="Breadcrumb" className="-ml-2 flex min-w-0 items-center">
        <ol className="flex min-w-0 items-center gap-0.5">
          <li>
            <Crumb>People</Crumb>
          </li>
          <li aria-hidden="true" className="text-content-quaternary text-[15px]">
            /
          </li>
          <li>
            <Crumb current hasMenu>My Contacts</Crumb>
          </li>
        </ol>
      </nav>

      <div className="flex shrink-0 items-center gap-2">
        <Button variant="ghost" className="h-[30px] w-auto px-2.5 text-[13px]">
          Edit
        </Button>
        <Button>Add Contact</Button>
        <Button variant="ghost" aria-label="Chat"
          className="border-button-border size-[36px] rounded-lg border">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M17.2 9.6a6.6 6 0 0 1-6.6 6 8 8 0 0 1-3-.6l-3.8 1.2 1.1-3.1a5.8 5.8 0 0 1-1.1-3.5 6.6 6 0 0 1 6.8-6 6.6 6 0 0 1 6.6 6z"
              stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
          </svg>
        </Button>
      </div>
    </header>
  )
}
