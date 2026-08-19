import { useState } from 'react'
import { cn } from '@/lib/cn'
import { CheckIcon } from '../icons'
import { type EnrichResult, type EnrichmentDef } from '@/data/enrichments'
import { DialogShell, DIALOG_BTN_PRIMARY, DIALOG_BTN_SECONDARY } from './DialogShell'

/**
 * Post-run field expander: everything the enrichment already fetched, one
 * checkbox per field, sample values from the first matched trial row. Free
 * and reversible — nothing is re-fetched, only shown.
 */
export function AddFieldsModal({
  def, sampleResult, sampleName, added, onApply, onClose,
}: {
  def: EnrichmentDef
  sampleResult: EnrichResult
  sampleName: string
  added: string[]
  onApply: (keys: string[]) => void
  onClose: () => void
}) {
  const [draft, setDraft] = useState(() => new Set(added))

  function toggle(key: string) {
    setDraft((cur) => {
      const next = new Set(cur)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const adding = def.fields.filter((f) => draft.has(f.key) && !added.includes(f.key)).length
  const removing = added.filter((k) => !draft.has(k)).length
  const parts = [adding && `add ${adding}`, removing && `remove ${removing}`].filter(Boolean)
  /* Order preserved from the enrichment's own field list, not click order. */
  const result = def.fields.filter((f) => draft.has(f.key)).map((f) => f.key)

  return (
    <DialogShell
      title="Add fields as columns"
      subtitle={`Already fetched — showing what came back for ${sampleName}`}
      onClose={onClose}
      footer={
        <>
          <span className="text-content-tertiary mr-auto text-[12px]">
            {parts.length ? `Will ${parts.join(' · ')}` : 'No changes'}
          </span>
          <button type="button" className={DIALOG_BTN_SECONDARY} onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className={DIALOG_BTN_PRIMARY}
            disabled={parts.length === 0}
            onClick={() => onApply(result)}
          >
            {removing && !adding ? 'Remove columns' : 'Add columns'}
          </button>
        </>
      }
    >
      <div className="py-4">
        <div className="border-line overflow-hidden rounded-[10px] border">
          {def.fields.map((f) => {
            const on = draft.has(f.key)
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => toggle(f.key)}
                className="border-line hover:bg-os-gray-50 focus-visible:ring-ring/50 flex w-full cursor-pointer items-center gap-3 border-b px-3 py-2 text-left outline-none focus-visible:ring-inset focus-visible:ring-[3px] last:border-b-0"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'flex size-4 shrink-0 items-center justify-center rounded-[4.5px] border-[1.5px]',
                    on ? 'border-accent-ai bg-accent-ai text-white' : 'border-line-strong',
                  )}
                >
                  {on && <CheckIcon className="size-2.5 motion-safe:animate-check-in" />}
                </span>
                <span className="w-[132px] shrink-0 text-[13px]">{f.label}</span>
                <span className="text-content-secondary min-w-0 flex-1 truncate font-mono text-[12.5px]">
                  {sampleResult.fields[f.key] || '—'}
                </span>
                <span
                  className={cn(
                    'w-[74px] shrink-0 text-right text-[11.5px]',
                    f.fill < 70 ? 'text-amber-600' : 'text-content-tertiary',
                  )}
                >
                  {f.fill}% filled
                </span>
              </button>
            )
          })}
        </div>
        <p className="text-content-tertiary mt-2.5 text-[12px]">
          Adding a field is free and reversible — nothing is re-fetched.
        </p>
      </div>
    </DialogShell>
  )
}
