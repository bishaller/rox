import { useState } from 'react'
import { cn } from '@/lib/cn'
import { ChevronDownIcon, EllipsisIcon } from '../icons'
import { toast } from '@/components/ui/toast'
import {
  type EnrichmentDef, type MatchPill, type ProviderName, FULL_COUNT, TRIAL_SIZE,
} from '@/data/enrichments'
import { DialogShell, DIALOG_BTN_PRIMARY, DIALOG_BTN_SECONDARY } from './DialogShell'

const SECT_LABEL =
  'text-content-tertiary mb-2.5 text-[10.5px] font-semibold tracking-[0.06em] uppercase'

/**
 * The escape hatch behind the trial bar's Adjust — waterfall order, what the
 * match keys on, and a row filter. Not a gate: the trial already ran, and
 * changes re-trial the same rows so the two results can be compared.
 */
export function AdjustModal({
  def, providers, onProvidersChange, rowFilter, onRowFilterChange, onRetrial, onRunAll, onClose,
}: {
  def: EnrichmentDef
  providers: ProviderName[]
  onProvidersChange: (p: ProviderName[]) => void
  rowFilter: string
  onRowFilterChange: (s: string) => void
  onRetrial: () => void
  onRunAll: () => void
  onClose: () => void
}) {
  const [dragFrom, setDragFrom] = useState<number | null>(null)
  const [filterOpen, setFilterOpen] = useState(rowFilter.length > 0)
  const draggable = providers.length > 1

  function drop(to: number) {
    if (dragFrom === null || dragFrom === to) return
    const next = [...providers]
    const [moved] = next.splice(dragFrom, 1)
    next.splice(to, 0, moved)
    onProvidersChange(next)
    toast('Order changed — hit Re-trial 10 to compare')
  }

  return (
    <DialogShell
      title={`Adjust · ${def.name}`}
      subtitle={`Changes re-trial the same ${TRIAL_SIZE} rows so you can compare`}
      onClose={onClose}
      footer={
        <>
          <span className="text-content-tertiary mr-auto min-w-0 truncate text-[12px]">
            Trial results update in the table behind this panel.
          </span>
          <button type="button" className={DIALOG_BTN_SECONDARY} onClick={onRetrial}>
            Re-trial {TRIAL_SIZE}
          </button>
          <button type="button" className={DIALOG_BTN_PRIMARY} onClick={onRunAll}>
            Run all {FULL_COUNT.toLocaleString('en-US')}
          </button>
        </>
      }
    >
      <section className="border-line border-b py-4">
        <div className={SECT_LABEL}>
          {draggable ? 'Sources — drag to reorder' : 'Source'}
        </div>
        {/* Stacked, not inline: the order reads top-to-bottom the way the
            waterfall actually runs, and each row is a full-width drag target. */}
        <div className="flex flex-col gap-1">
          {providers.map((p, i) => (
            <div
              key={p}
              draggable={draggable}
              onDragStart={() => setDragFrom(i)}
              onDragEnd={() => setDragFrom(null)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); drop(i) }}
              className={cn(
                'border-line-strong flex items-center gap-2.5 rounded-lg border bg-white',
                'px-2.5 py-2 text-[13px] select-none',
                draggable && 'hover:border-ring cursor-grab',
                dragFrom === i && 'opacity-40',
              )}
            >
              <span className="bg-os-gray-100 text-content-secondary flex size-4 shrink-0 items-center justify-center rounded text-[10px] font-bold">
                {i + 1}
              </span>
              <span className="min-w-0 flex-1 truncate">{p}</span>
              {i === 0 && (
                <span className="text-content-tertiary shrink-0 text-[11px]">tried first</span>
              )}
              {draggable && (
                <EllipsisIcon className="size-3.5 shrink-0 rotate-90 text-stone-300" aria-hidden="true" />
              )}
            </div>
          ))}
        </div>
        <p className="text-content-tertiary mt-2 text-[12px]">
          {draggable
            ? 'Tries each source in order, stops at the first match. Charged once per contact.'
            : 'Charged once per contact.'}
        </p>
      </section>

      <section className="border-line border-b py-4">
        <div className={SECT_LABEL}>Matching on</div>
        <div className="flex flex-wrap items-center gap-2">
          {def.matching.map((pill) => <MatchPillView key={pill.label} pill={pill} />)}
          <button
            type="button"
            className="cursor-pointer text-[12.5px] text-indigo-800 hover:underline"
            onClick={() => toast('Opens a mapping list — only needed when auto-detect fails')}
          >
            Change
          </button>
        </div>
        {def.matchHint && (
          <p className="text-content-tertiary mt-2 text-[12px]">{def.matchHint}</p>
        )}
      </section>

      <section className="py-4">
        <button
          type="button"
          aria-expanded={filterOpen}
          onClick={() => setFilterOpen((o) => !o)}
          className="text-content-secondary hover:text-content-primary flex cursor-pointer items-center gap-2 text-[13px]"
        >
          <ChevronDownIcon
            className={cn('size-3 transition-transform duration-150', !filterOpen && '-rotate-90')}
          />
          Only run on some rows
        </button>
        {filterOpen && (
          <div className="pt-2.5">
            <textarea
              value={rowFilter}
              onChange={(e) => onRowFilterChange(e.target.value)}
              placeholder="row.title === '' && row.linkedin_url !== ''"
              className="border-button-border focus-visible:border-ring h-14 w-full resize-none rounded-lg border px-2.5 py-2 font-mono text-[12.5px] outline-none"
            />
            <p className="text-content-tertiary mt-1.5 text-[12px]">
              Leave empty to run on all {FULL_COUNT.toLocaleString('en-US')} contacts in this view.
            </p>
          </div>
        )}
      </section>
    </DialogShell>
  )
}

function MatchPillView({ pill }: { pill: MatchPill }) {
  return (
    <span
      className={cn(
        'flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[13px]',
        pill.tone === 'ok' && 'border-green-200 bg-green-50 text-green-700',
        pill.tone === 'add' && 'border-line bg-os-gray-50 text-content-secondary',
        pill.tone === 'warn' && 'border-amber-200/70 bg-amber-50 text-amber-700',
      )}
    >
      {pill.tone === 'ok' && <span aria-hidden="true">✓</span>}
      {pill.tone === 'warn' && <span aria-hidden="true">⚠</span>}
      <span className="font-medium">{pill.label}</span>
      {pill.pct && <span className="text-[11.5px] opacity-85">{pill.pct}</span>}
    </span>
  )
}
