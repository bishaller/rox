export type Account = {
  id: string
  name: string
  domain: string
}

/** The five rows of frame 3779:3653, in their displayed order. */
export const accounts: Account[] = [
  { id: 'a1', name: 'CBRE', domain: 'cbre.com' },
  { id: 'a2', name: 'Paychex', domain: 'paychex.com' },
  { id: 'a3', name: 'KBR', domain: 'kbr.com' },
  { id: 'a4', name: 'Dex Terra', domain: 'dexterra.com' },
  { id: 'a5', name: 'Boomi', domain: 'boomi.com' },
]

/**
 * Column widths from the frame: 48 · 230 · 160. There is no width for the
 * Add-column rail — it absorbs the rest of the panel, so the grid always runs
 * edge to edge.
 */
export const ACCOUNT_COLUMNS = {
  select: 48,
  name: 230,
  domain: 160,
} as const

/** Row and header heights, per the frame — the same 42/48 the People grid uses. */
export const ACCOUNT_ROW_HEIGHT = 48
export const ACCOUNT_HEADER_HEIGHT = 42
