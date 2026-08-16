import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

export type PillTone = 'accent-select' | 'neutral'

export interface PillProps extends HTMLAttributes<HTMLDivElement> {
  tone?: PillTone
  leading?: ReactNode
  trailing?: ReactNode
  children: ReactNode
}

/** Base ring, lifted verbatim from the live DOM. */
const BASE =
  'group/pill relative inline-flex max-w-full select-none items-center ' +
  'rounded-full border font-sans text-sm font-normal leading-none transition-all ' +
  'outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring ' +
  '[&_svg]:pointer-events-none [&_svg]:shrink-0 ' +
  'gap-1.5 px-2.5 py-1.5 min-h-[30px] ' +
  '[&_[data-slot=pill-leading]_svg]:size-4 [&_[data-slot=pill-trailing]_svg]:size-4'

const TONES: Record<PillTone, string> = {
  'accent-select': cn(
    'bg-accent-select/10 text-accent-select border-accent-select/25',
    'hover:bg-accent-select/20',
    '[&_[data-slot=pill-leading]]:text-accent-select [&_[data-slot=pill-trailing]]:text-accent-select',
    '[&_[data-slot=pill-leading]_svg]:text-accent-select [&_[data-slot=pill-trailing]_svg]:text-accent-select',
  ),
  // Design shows inactive tabs bordered but flat — border, no elevation.
  neutral: cn(
    'bg-card text-content-secondary border-button-border',
    'hover:bg-button-hover hover:border-button-border-hover',
    '[&_[data-slot=pill-leading]]:text-content-tertiary [&_[data-slot=pill-trailing]]:text-content-tertiary',
  ),
}

export function Pill({
  tone = 'accent-select', leading, trailing, className, children, ...props
}: PillProps) {
  return (
    <div data-slot="pill" className={cn(BASE, TONES[tone], className)} {...props}>
      {leading ? <span data-slot="pill-leading">{leading}</span> : null}
      <span data-slot="pill-text" className="min-w-0 truncate">
        <span className="inline-flex items-center gap-1.5">{children}</span>
      </span>
      {trailing ? <span data-slot="pill-trailing">{trailing}</span> : null}
    </div>
  )
}
