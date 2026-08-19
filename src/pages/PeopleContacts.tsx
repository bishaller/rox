import { useMemo, useRef, useState } from 'react'
import { cn } from '@/lib/cn'
import type { Filter, FilterJoin, SortState } from '@/lib/filters'
import type { View } from '@/components/rox/ViewTabs'
import { contacts } from '@/data/contacts'
import { EXISTING_FIELDS, existingKey } from '@/data/enrichments'
import { deriveRows } from '@/lib/deriveRows'
import { useTableConfig } from '@/dev/tableConfig'
import { Sidebar } from '@/components/rox/Sidebar'
import { TopBar } from '@/components/rox/TopBar'
import { Toolbar } from '@/components/rox/Toolbar'
import { ViewTabs } from '@/components/rox/ViewTabs'
import { DataTable } from '@/components/rox/DataTable'
import { ContextMenu } from '@/components/rox/ContextMenu'
import type { Anchor } from '@/components/rox/overlay'
import { ToastSurface, toast } from '@/components/ui/toast'
import { useEnrichmentFlow } from '@/components/rox/enrichment/useEnrichmentFlow'
import { EnrichPopover } from '@/components/rox/enrichment/EnrichPopover'
import { TrialBar } from '@/components/rox/enrichment/TrialBar'
import { AdjustModal } from '@/components/rox/enrichment/AdjustModal'
import { AddFieldsModal } from '@/components/rox/enrichment/AddFieldsModal'
import { FieldsModal } from '@/components/rox/enrichment/FieldsModal'
import { CleverColumnPanel } from '@/components/rox/enrichment/CleverColumnPanel'

/** Which centred dialog is up. One at a time, exactly like the reference. */
type Layer =
  | { kind: 'adjust' }
  | { kind: 'fields'; prefill?: string }
  | { kind: 'addFields' }
  | null

export function PeopleContacts({ onNavigate }: { onNavigate?: (page: string) => void }) {
  /* Lifted so the Toolbar's search box and the table share one source of truth. */
  const [query, setQuery] = useState('')
  /* Lifted for the same reason as `query`: the toolbar edits them, the table
     applies them. */
  const [filters, setFilters] = useState<Filter[]>([])
  /** How the filter conditions combine — the panel's and/or switch. */
  const [join, setJoin] = useState<FilterJoin>('and')
  /* Lifted out of the table so the toolbar's Sort menu and saved views can
     drive it, not only the column headers. */
  const [sort, setSort] = useState<SortState | null>(null)
  const { config } = useTableConfig()

  /* ── enrichment flow ──────────────────────────────────────────────────── */

  /* What the user can currently see, in order — the trial runs on the first
     ten of these. Read through a ref so `startTrial` sees the live list. */
  const visible = useMemo(
    () => deriveRows(contacts, { query, filters, sort, join }),
    [query, filters, sort, join],
  )
  const visibleRef = useRef(visible)
  visibleRef.current = visible

  const flow = useEnrichmentFlow(() => visibleRef.current)

  const [popoverAnchor, setPopoverAnchor] = useState<Anchor | null>(null)
  /* The Clever quick setup takes over the popover's anchor when picked. */
  const [clever, setClever] = useState<{ anchor: Anchor; prefill: string } | null>(null)
  const [colMenuAnchor, setColMenuAnchor] = useState<Anchor | null>(null)
  const [layer, setLayer] = useState<Layer>(null)

  /* Live visibility of the existing (already-synced) fields; the catalogue's
     `shown` flags are only the seed. Cosmetic — no table columns move. */
  const [shownExisting, setShownExisting] = useState(
    () => new Set(EXISTING_FIELDS.filter((f) => f.shown).map(existingKey)),
  )

  function toggleExisting(key: string) {
    const name = key.slice(key.indexOf(':') + 1)
    const wasShown = shownExisting.has(key)
    setShownExisting((cur) => {
      const next = new Set(cur)
      if (wasShown) next.delete(key)
      else next.add(key)
      return next
    })
    toast(wasShown ? `${name} hidden` : `${name} shown — undo anytime, nothing was fetched`)
  }

  /* The first trial row the enrichment matched — the field expander's sample. */
  const sample = useMemo(() => {
    for (const id of flow.trialIds) {
      const contact = contacts.find((c) => c.id === id)
      if (!contact) continue
      const result = flow.resultFor(contact)
      if (result) return { contact, result }
    }
    return null
  }, [flow.trialIds, flow.resultFor])

  function openAddFields() {
    if (!sample) {
      toast('Nothing matched — no fields to pull out. Adjust or discard the trial.')
      return
    }
    setLayer({ kind: 'addFields' })
  }

  /* Selecting a view replaces the table's whole definition with the view's. */
  function applyView(view: View) {
    setFilters(view.filters ?? [])
    setJoin('and')
    setQuery(view.query ?? '')
    setSort(view.sort ?? null)
  }
  const boxed = config.boxed

  return (
    /* data-motion up here (not only on the table) so the dev panel's motion
       switch reaches the trial bar, popover, toasts, and dialogs too. */
    <div
      className="bg-app-bg flex h-full w-full overflow-hidden"
      data-motion={config.motion ? 'on' : 'off'}
    >
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
              sort={sort} onSortChange={setSort}
              join={join} onJoinChange={setJoin}
              resultCount={visible.length} />
          </div>

          {(flow.phase === 'trial-running' || flow.phase === 'trial-ready') && flow.def && (
            <TrialBar
              phase={flow.phase}
              def={flow.def}
              matched={flow.matched}
              total={flow.trialIds.length}
              providers={flow.providers}
              onDiscard={flow.discard}
              onAdjust={() => setLayer({ kind: 'adjust' })}
              onRunAll={flow.runAll}
            />
          )}

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
                filterJoin={join}
                onAddColumn={setPopoverAnchor}
                enrichment={flow.phase !== 'idle' && flow.def ? {
                  phase: flow.phase,
                  def: flow.def,
                  trialIds: flow.trialIds,
                  revealed: flow.revealed,
                  addedFields: flow.addedFields,
                  resultFor: flow.resultFor,
                  onHeaderMenu: setColMenuAnchor,
                } : null}
              />
            </div>
          </div>
        </div>
      </div>

      {popoverAnchor && (
        <EnrichPopover
          anchor={popoverAnchor}
          onClose={() => setPopoverAnchor(null)}
          onPickEnrichment={(id) => { setPopoverAnchor(null); flow.startTrial(id) }}
          onPickCreate={(label) => {
            setPopoverAnchor(null)
            toast(`“${label}” — creation flows are out of scope here; every enrichment is live`)
          }}
          onPickClever={(q) => {
            setClever({ anchor: popoverAnchor, prefill: q })
            setPopoverAnchor(null)
          }}
          onToggleExisting={(key) => { setPopoverAnchor(null); toggleExisting(key) }}
          onOpenFields={(prefill) => { setPopoverAnchor(null); setLayer({ kind: 'fields', prefill }) }}
          shownExisting={shownExisting}
        />
      )}

      {clever && (
        <CleverColumnPanel
          anchor={clever.anchor}
          prefill={clever.prefill}
          onGenerate={() => {
            setClever(null)
            toast('Clever column queued — generation is out of scope in this prototype')
          }}
          onManualSetup={() => {
            setClever(null)
            toast('Manual column setup is out of scope in this prototype')
          }}
          onClose={() => setClever(null)}
        />
      )}

      {colMenuAnchor && flow.phase !== 'idle' && (
        <ContextMenu
          anchor={colMenuAnchor}
          onClose={() => setColMenuAnchor(null)}
          items={[
            {
              label: 'Add fields as columns',
              onSelect: () => { setColMenuAnchor(null); openAddFields() },
            },
            ...(flow.phase !== 'ran' ? [{
              label: 'Adjust enrichment',
              onSelect: () => { setColMenuAnchor(null); setLayer({ kind: 'adjust' }) },
            }] : []),
            {
              label: 'Discard column',
              tone: 'destructive' as const,
              onSelect: () => { setColMenuAnchor(null); flow.discard() },
            },
          ]}
        />
      )}

      {layer?.kind === 'adjust' && flow.def && (
        <AdjustModal
          def={flow.def}
          providers={flow.providers}
          onProvidersChange={flow.setProviders}
          rowFilter={flow.rowFilter}
          onRowFilterChange={flow.setRowFilter}
          onRetrial={() => { setLayer(null); flow.retrial() }}
          onRunAll={() => { setLayer(null); flow.runAll() }}
          onClose={() => setLayer(null)}
        />
      )}

      {layer?.kind === 'addFields' && flow.def && sample && (
        <AddFieldsModal
          def={flow.def}
          sampleResult={sample.result}
          sampleName={sample.contact.name}
          added={flow.addedFields}
          onApply={(keys) => { setLayer(null); flow.applyFields(keys) }}
          onClose={() => setLayer(null)}
        />
      )}

      {layer?.kind === 'fields' && (
        <FieldsModal
          initialQuery={layer.prefill}
          shown={shownExisting}
          onToggle={toggleExisting}
          onClose={() => setLayer(null)}
        />
      )}

      <ToastSurface />
    </div>
  )
}
