export type Account = {
  id: string
  name: string
  domain: string
}

/** The six rows visible in the Accounts capture, in their displayed order. */
export const accounts: Account[] = [
  { id: 'a1', name: 'Boomi Inc', domain: 'boomi.com' },
  { id: 'a2', name: 'Cbre', domain: 'cbre.com' },
  { id: 'a3', name: 'Metrolinx', domain: 'metrolinx.com' },
  { id: 'a4', name: 'Paychex', domain: 'paychex.com' },
  { id: 'a5', name: 'Dexterra', domain: 'dexterra.com' },
  { id: 'a6', name: 'KBR', domain: 'kbr.com' },
]

/**
 * Column widths measured off the capture at its verified 1.1574 scale:
 * 46 · 240 · 180 · 176 = 642, which is the table's full width — the Accounts
 * grid does not fill the panel, it stops and leaves white to its right.
 */
export const ACCOUNT_COLUMNS = {
  select: 46,
  name: 240,
  domain: 180,
  addColumn: 176,
} as const

export const ACCOUNTS_TABLE_WIDTH =
  ACCOUNT_COLUMNS.select + ACCOUNT_COLUMNS.name + ACCOUNT_COLUMNS.domain + ACCOUNT_COLUMNS.addColumn

/** Row and header heights, also measured — note rows are 45 here, not 48. */
export const ACCOUNT_ROW_HEIGHT = 45
export const ACCOUNT_HEADER_HEIGHT = 40
