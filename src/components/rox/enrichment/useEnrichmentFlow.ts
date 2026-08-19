import { useEffect, useMemo, useRef, useState } from 'react'
import { type Contact, contacts } from '@/data/contacts'
import {
  type EnrichResult, type EnrichmentDef, type EnrichmentId, type ProviderName,
  FULL_COUNT, TRIAL_SIZE, enrichmentById, resultFor,
} from '@/data/enrichments'
import { toast } from '@/components/ui/toast'

export type EnrichPhase = 'idle' | 'trial-running' | 'trial-ready' | 'ran'

/**
 * The enrichment flow's state machine, owned by the page:
 *
 *   idle → trial-running → trial-ready → ran
 *
 * `discard()` returns to idle from anywhere; picking another enrichment while
 * one is active replaces it. One `useState` object so every transition is
 * atomic — a phase can never be observed with the previous trial's rows.
 */
type FlowState = {
  phase: EnrichPhase
  def: EnrichmentDef | null
  /** Waterfall order — mutable via Adjust's drag. */
  providers: ProviderName[]
  /** The 10 rows the trial ran on; a re-trial reuses them for comparison. */
  trialIds: string[]
  /** How many trial rows have resolved — skeletons below this index. */
  revealed: number
  /** Field keys pulled out as their own columns after the run. */
  addedFields: string[]
}

const IDLE: FlowState = {
  phase: 'idle', def: null, providers: [], trialIds: [], revealed: 0, addedFields: [],
}

export type EnrichmentFlow = FlowState & {
  rowFilter: string
  /** Trial rows the enrichment found something for. */
  matched: number
  resultFor: (c: Contact) => EnrichResult | null
  startTrial: (id: EnrichmentId) => void
  retrial: () => void
  discard: () => void
  runAll: () => void
  setProviders: (p: ProviderName[]) => void
  setRowFilter: (s: string) => void
  applyFields: (keys: string[]) => void
}

const byId = new Map(contacts.map((c) => [c.id, c]))

export function useEnrichmentFlow(getVisibleRows: () => Contact[]): EnrichmentFlow {
  const [state, setState] = useState<FlowState>(IDLE)
  /** Cosmetic in this prototype — the Adjust panel's row-filter expression. */
  const [rowFilter, setRowFilter] = useState('')

  /* Mirror for handlers that need the current state without stale closures. */
  const stateRef = useRef(state)
  stateRef.current = state

  /* Cleared on every transition and on unmount, so a pending reveal (or the
     queued follow-up toast) cannot fire into a state it wasn't part of. */
  const timers = useRef<number[]>([])
  const clearTimers = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }
  useEffect(() => () => clearTimers(), [])

  /** Staggered reveal — the same optimistic cadence as the reference flow. */
  function schedule(trial: string[]) {
    if (trial.length === 0) {
      setState((s) => ({ ...s, phase: 'trial-ready' }))
      return
    }
    trial.forEach((_, i) => {
      timers.current.push(window.setTimeout(() => {
        setState((s) => ({
          ...s,
          revealed: i + 1,
          phase: i + 1 === trial.length ? 'trial-ready' : s.phase,
        }))
      }, 380 + i * 300))
    })
  }

  function startTrial(id: EnrichmentId) {
    const def = enrichmentById(id)
    const replacing = stateRef.current.phase !== 'idle'
    clearTimers()
    const trialIds = getVisibleRows().slice(0, TRIAL_SIZE).map((c) => c.id)
    setState({
      phase: 'trial-running', def, providers: [...def.providers],
      trialIds, revealed: 0, addedFields: [],
    })
    if (replacing) toast(`Switched to ${def.name} — one enrichment at a time in this prototype`)
    schedule(trialIds)
  }

  function retrial() {
    const { trialIds } = stateRef.current
    clearTimers()
    setState((s) => ({ ...s, phase: 'trial-running', revealed: 0 }))
    schedule(trialIds)
  }

  function discard() {
    const wasRan = stateRef.current.phase === 'ran'
    clearTimers()
    setState(IDLE)
    setRowFilter('')
    toast(wasRan ? 'Column removed' : 'Trial discarded — 10 credits used')
  }

  function runAll() {
    const def = stateRef.current.def
    if (!def) return
    clearTimers()
    setState((s) => ({ ...s, phase: 'ran', revealed: s.trialIds.length }))
    toast(`Running ${def.name} on ${FULL_COUNT.toLocaleString('en-US')} contacts in the background`)
    timers.current.push(window.setTimeout(() => {
      toast(`Click ▾ on the ${def.columnLabel} column to pull out more fields`)
    }, 2400))
  }

  function applyFields(keys: string[]) {
    setState((s) => ({ ...s, addedFields: keys }))
    toast(keys.length
      ? `${keys.length} column${keys.length > 1 ? 's' : ''} added`
      : 'Columns removed')
  }

  const { def, providers } = state
  const result = useMemo(
    () => (c: Contact) => (def ? resultFor(def, c, providers) : null),
    [def, providers],
  )

  const matched = useMemo(
    () => state.trialIds.filter((id) => {
      const c = byId.get(id)
      return c ? result(c) !== null : false
    }).length,
    [state.trialIds, result],
  )

  return {
    ...state, rowFilter, matched, resultFor: result,
    startTrial, retrial, discard, runAll,
    setProviders: (p) => setState((s) => ({ ...s, providers: p })),
    setRowFilter, applyFields,
  }
}
