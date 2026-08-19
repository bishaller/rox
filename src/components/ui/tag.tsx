import { cn } from '@/lib/cn'

/** Status values the AI/enrichment column can return. */
export type TagTone = 'pending' | 'done' | 'warning' | 'error' | 'neutral'

const TONE_DOT: Record<TagTone, string> = {
  pending: 'bg-content-quaternary',
  done: 'bg-accent-green-primary',
  warning: 'bg-accent-yellow-primary',
  error: 'bg-accent-red-primary',
  neutral: 'bg-content-quaternary',
}

/**
 * Small dot + label chip. Used by the enrichment column so its values read as
 * discrete states rather than free text, and so additional statuses can be
 * added without redesigning the cell.
 */
export function Tag({
  children, tone = 'neutral', pulse = false, className,
}: {
  children: React.ReactNode
  tone?: TagTone
  /** Breathes the dot — for states that are in flight rather than settled. */
  pulse?: boolean
  className?: string
}) {
  return (
    <span
      className={cn(
        'border-border-tertiary bg-card text-content-secondary inline-flex min-w-0 items-center',
        'gap-1.5 rounded-full border px-2 py-0.5 text-xs leading-none',
        className,
      )}
    >
      <span aria-hidden="true"
        className={cn('size-1.5 shrink-0 rounded-full', TONE_DOT[tone], pulse && 'motion-safe:animate-pulse')} />
      <span className="truncate">{children}</span>
    </span>
  )
}
