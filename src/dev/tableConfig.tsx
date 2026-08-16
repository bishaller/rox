import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

/* ─────────────────────────────────────────────────────────
 * Table variant configuration.
 *
 * Everything that CAN be independent is an independent boolean, so any
 * combination is reachable. Only `density` and `fontSize` stay exclusive —
 * a row cannot be two heights at once.
 *
 * Add a new axis by extending TableConfig and giving it a control in
 * DevPanel — nothing else needs to know.
 * ───────────────────────────────────────────────────────── */

export type Density = 'compact' | 'default' | 'comfortable'

export type TableConfig = {
  /* Exclusive scales — genuinely single-valued. */
  density: Density
  fontSize: 12 | 13 | 14

  /* Grid lines, one boolean per axis. Both off = no rules at all. */
  gridH: boolean
  gridV: boolean

  /* Left column. Both on = number that swaps to a checkbox on hover/selection.
     Both off = an empty gutter. */
  showRowNumber: boolean
  showCheckbox: boolean

  /* Enrichment column. Both on = the glyph inside the chip. Both off = plain text. */
  enrichTag: boolean
  enrichGlyph: boolean

  striped: boolean
  stickyColumns: boolean
  showFooter: boolean
  /** Table sits in its own rounded, bordered card with side gutters. */
  boxed: boolean
  /** Entrance stagger, hover fades, sort transitions. Off = everything snaps. */
  motion: boolean
}

export const ROW_HEIGHTS: Record<Density, number> = {
  compact: 32,
  default: 48,
  comfortable: 56,
}

/** Named bundles. `rox` reproduces the live app as captured. */
export const PRESETS: Record<string, { label: string; config: TableConfig }> = {
  rox: {
    label: 'Rox (as captured)',
    config: {
      density: 'default', fontSize: 13, gridH: true, gridV: true,
      showRowNumber: true, showCheckbox: true, enrichTag: false, enrichGlyph: true,
      striped: false, stickyColumns: true, showFooter: false, boxed: false, motion: true,
    },
  },
  enhanced: {
    label: 'Enhanced',
    config: {
      density: 'default', fontSize: 13, gridH: true, gridV: true,
      showRowNumber: true, showCheckbox: true, enrichTag: true, enrichGlyph: false,
      striped: false, stickyColumns: true, showFooter: true, boxed: false, motion: true,
    },
  },
  compact: {
    label: 'Compact',
    config: {
      density: 'compact', fontSize: 12, gridH: true, gridV: false,
      showRowNumber: false, showCheckbox: true, enrichTag: true, enrichGlyph: false,
      striped: true, stickyColumns: true, showFooter: true, boxed: false, motion: true,
    },
  },
  airy: {
    label: 'Airy',
    config: {
      density: 'comfortable', fontSize: 14, gridH: true, gridV: false,
      showRowNumber: true, showCheckbox: true, enrichTag: true, enrichGlyph: false,
      striped: false, stickyColumns: true, showFooter: true, boxed: false, motion: true,
    },
  },
  minimal: {
    label: 'Minimal',
    config: {
      density: 'default', fontSize: 13, gridH: false, gridV: false,
      showRowNumber: true, showCheckbox: false, enrichTag: false, enrichGlyph: false,
      striped: false, stickyColumns: false, showFooter: false, boxed: false, motion: true,
    },
  },
  everything: {
    label: 'Everything on',
    config: {
      density: 'default', fontSize: 13, gridH: true, gridV: true,
      showRowNumber: true, showCheckbox: true, enrichTag: true, enrichGlyph: true,
      striped: true, stickyColumns: true, showFooter: true, boxed: true, motion: true,
    },
  },
}

export const DEFAULT_PRESET = 'enhanced'
/* v2: the shape changed from exclusive enums to independent booleans. */
const STORAGE_KEY = 'rox.dev.tableConfig.v2'

type Ctx = {
  config: TableConfig
  setConfig: <K extends keyof TableConfig>(key: K, value: TableConfig[K]) => void
  toggle: (key: BooleanKey) => void
  applyPreset: (id: string) => void
  activePreset: string | null
  reset: () => void
}

/** Every axis that is a plain on/off switch. */
export type BooleanKey = {
  [K in keyof TableConfig]: TableConfig[K] extends boolean ? K : never
}[keyof TableConfig]

const TableConfigContext = createContext<Ctx | null>(null)

function load(): TableConfig {
  if (typeof localStorage === 'undefined') return PRESETS[DEFAULT_PRESET].config
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...PRESETS[DEFAULT_PRESET].config, ...JSON.parse(raw) }
  } catch {
    /* corrupted value — fall through to the default */
  }
  return PRESETS[DEFAULT_PRESET].config
}

export function TableConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setState] = useState<TableConfig>(load)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
    } catch {
      /* storage full or blocked — the panel still works for this session */
    }
  }, [config])

  const setConfig = useCallback(
    <K extends keyof TableConfig>(key: K, value: TableConfig[K]) =>
      setState((c) => ({ ...c, [key]: value })),
    [],
  )

  const toggle = useCallback(
    (key: BooleanKey) => setState((c) => ({ ...c, [key]: !c[key] })),
    [],
  )

  const applyPreset = useCallback((id: string) => {
    const preset = PRESETS[id]
    if (preset) setState(preset.config)
  }, [])

  const reset = useCallback(() => setState(PRESETS[DEFAULT_PRESET].config), [])

  /** Which preset, if any, the current knobs exactly match. */
  const activePreset = useMemo(() => {
    const match = Object.entries(PRESETS).find(([, p]) =>
      (Object.keys(p.config) as (keyof TableConfig)[]).every((k) => p.config[k] === config[k]),
    )
    return match ? match[0] : null
  }, [config])

  const value = useMemo(
    () => ({ config, setConfig, toggle, applyPreset, activePreset, reset }),
    [config, setConfig, toggle, applyPreset, activePreset, reset],
  )

  return <TableConfigContext.Provider value={value}>{children}</TableConfigContext.Provider>
}

export function useTableConfig() {
  const ctx = useContext(TableConfigContext)
  if (!ctx) throw new Error('useTableConfig must be used inside <TableConfigProvider>')
  return ctx
}
