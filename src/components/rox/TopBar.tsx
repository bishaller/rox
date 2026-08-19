import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { CommentIcon } from './icons'

/**
 * A breadcrumb segment. Rests as bare text and picks up a grey pill on hover;
 * the parent crumb also darkens from muted to primary.
 *
 * 20px, not 15px — the frame sets both crumbs at the same size and separates
 * them by weight of colour alone, with no chevron on the current page.
 */
function Crumb({
  children, current,
}: {
  children: ReactNode
  /** The crumb for the page you're on — always full contrast. */
  current?: boolean
}) {
  return (
    <button
      type="button"
      aria-current={current ? 'page' : undefined}
      className={cn(
        'group flex h-[24px] cursor-pointer items-center rounded-md px-1.5 text-[20px] font-medium',
        /* Geist ships a small negative default at this size; the frame sets none. */
        'tracking-normal',
        'hover:bg-stone-100 focus-visible:ring-ring/50 outline-none transition-colors focus-visible:ring-[3px]',
        current ? 'text-stone-800' : 'text-stone-400 hover:text-stone-800',
      )}
    >
      {children}
    </button>
  )
}

/* All three actions share a box; only the ground and the text weight differ. */
const ACTION =
  'flex h-[36px] shrink-0 cursor-pointer items-center justify-center rounded-[8px] ' +
  'text-[14px] font-medium whitespace-nowrap outline-none ' +
  /* Press feedback: the whole button dips, 150ms strong ease-out so the
     response lands on the way down. */
  'transition-[background-color,border-color,color,transform] duration-150 ease-out-strong ' +
  'active:scale-[0.97] ' +
  'focus-visible:ring-ring/50 focus-visible:ring-[3px]'

export function TopBar() {
  return (
    /* 48 tall with a hairline under it — the frame separates the breadcrumb
       band from the tab row, where the old 70px bar ran straight into it. */
    /* 48 tall, as in the frame — which sits its 36px action row 12px down
       rather than centring it. No bottom rule: the bar runs straight into the
       tab row below it. */
    <header className="bg-card flex h-[48px] shrink-0 items-start justify-between px-4 pt-3">
      {/* No negative margin: the crumb's own pill starts on the container's
          left edge, so it lines up with the first view tab and the row
          checkboxes below it. */}
      <nav aria-label="Breadcrumb" className="flex h-[36px] min-w-0 items-center">
        <ol className="flex min-w-0 items-center gap-0.5">
          <li>
            <Crumb>People</Crumb>
          </li>
          <li aria-hidden="true" className="text-[16px] font-semibold text-stone-200">
            /
          </li>
          <li>
            <Crumb current>Prospects</Crumb>
          </li>
        </ol>
      </nav>

      <div className="flex shrink-0 items-center gap-2">
        {/* px-2, not 3: the gap between buttons is 8px, and a wider ghost pad
            reads as extra gap because its ground only exists on hover. */}
        <button type="button" className={cn(ACTION, 'px-2 text-stone-600 hover:bg-stone-100')}>
          Edit
        </button>

        {/* The only raised control on the screen. */}
        <button type="button"
          className={cn(ACTION, 'border-line-strong shadow-raised border bg-white px-3 text-stone-800 hover:bg-stone-50')}>
          Add Contact
        </button>

        {/* Borderless in the frame — it reads as an icon affordance, not a button. */}
        <button type="button" aria-label="Chat"
          className={cn(ACTION, 'size-[36px] shrink-0 p-0 text-stone-600 hover:bg-stone-100')}>
          {/* Gravity's comment glyph fills its 16px box; the old hand-drawn
              path only spanned ~14 of a 20-unit viewBox and rendered ~12px. */}
          <CommentIcon className="shrink-0" />
        </button>
      </div>
    </header>
  )
}
