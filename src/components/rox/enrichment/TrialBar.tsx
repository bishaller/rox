import { cn } from '@/lib/cn'
import {
  type EnrichmentDef, type ProviderName, FULL_COUNT,
} from '@/data/enrichments'

/**
 * The band above the table while a trial is up: progress while it runs, the
 * verdict and the three ways forward once it lands. Lives outside the
 * scrollport so it never scrolls with the rows it is reporting on.
 */
export function TrialBar({
  phase, def, matched, total, providers, onDiscard, onAdjust, onRunAll,
}: {
  phase: 'trial-running' | 'trial-ready'
  def: EnrichmentDef
  matched: number
  total: number
  providers: ProviderName[]
  onDiscard: () => void
  onAdjust: () => void
  onRunAll: () => void
}) {
  const zero = phase === 'trial-ready' && matched === 0
  const pct = total ? Math.round((matched / total) * 100) : 0

  return (
    <div
      className={cn(
        'flex shrink-0 items-center gap-3 border-b px-4 py-2 text-[13px]',
        'motion-safe:animate-bar-in',
        zero ? 'border-amber-200/70 bg-amber-50' : 'border-line bg-os-gray-50',
      )}
    >
      {phase === 'trial-running' ? (
        <span className="text-content-secondary flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="size-3.5 shrink-0 rounded-full border-2 border-violet-300 border-t-violet-500 motion-safe:animate-spin motion-reduce:hidden"
          />
          Trialing {def.name} on {total} rows…
        </span>
      ) : zero ? (
        <>
          <span className="font-medium text-amber-700">0 of {total} matched</span>
          <span className="text-content-secondary min-w-0 truncate text-[12.5px]">
            {def.matchHint ?? 'Check the inputs this enrichment needs.'}
          </span>
        </>
      ) : (
        <>
          <span className="font-medium text-indigo-800">{matched} of {total} matched</span>
          <span className="text-content-tertiary min-w-0 truncate text-[12.5px]">
            via <b className="text-content-primary font-medium">{providers.join(' → ')}</b>
            {' · '}~{pct}% expected fill
          </span>
        </>
      )}

      <span className="flex-1" />

      {phase === 'trial-running' ? (
        <BarButton variant="ghost" onClick={onDiscard}>Discard</BarButton>
      ) : zero ? (
        <>
          <BarButton variant="secondary" onClick={onAdjust}>See why</BarButton>
          <BarButton variant="ghost" onClick={onDiscard}>Discard</BarButton>
        </>
      ) : (
        <>
          <BarButton variant="ghost" onClick={onDiscard}>Discard</BarButton>
          <BarButton variant="secondary" onClick={onAdjust}>Adjust</BarButton>
          <BarButton variant="primary" onClick={onRunAll}>
            Run all {FULL_COUNT.toLocaleString('en-US')}
          </BarButton>
        </>
      )}
    </div>
  )
}

function BarButton({
  variant, onClick, children,
}: {
  variant: 'ghost' | 'secondary' | 'primary'
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex h-[26px] shrink-0 cursor-pointer items-center rounded-[8px] px-2.5',
        'text-[12.5px] font-medium whitespace-nowrap outline-none',
        'transition-[background-color,transform] duration-150 ease-out-strong active:scale-[0.97]',
        'focus-visible:ring-ring/50 focus-visible:ring-[3px]',
        variant === 'ghost' && 'text-content-secondary hover:bg-stone-100',
        /* The Enrich chips' vocabulary — hairline border and the faintest lift. */
        variant === 'secondary' &&
          'border-line-strong shadow-raised border bg-white text-stone-800 hover:bg-stone-50',
        variant === 'primary' && 'bg-os-gray-950 text-white hover:bg-os-gray-800',
      )}
    >
      {children}
    </button>
  )
}
