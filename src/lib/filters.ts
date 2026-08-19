import type { Contact } from '@/data/contacts'

/** Contact fields a filter can be built on, in the table's column order. */
export const FILTER_FIELDS = [
  { key: 'name', label: 'Contact' },
  { key: 'companyName', label: 'Company' },
  { key: 'title', label: 'Title' },
  { key: 'email', label: 'Email' },
  { key: 'companyDomain', label: 'Domain' },
  { key: 'linkedinUrl', label: 'Linkedin' },
  { key: 'department', label: 'Department / Work Category' },
] as const satisfies readonly { key: keyof Contact; label: string }[]

export type FilterField = (typeof FILTER_FIELDS)[number]['key']

/**
 * The design only shows `contains`. The rest are the conventional companions —
 * a picker with a single option is not a picker.
 */
export const FILTER_OPS = [
  { key: 'contains', label: 'contains' },
  { key: 'notContains', label: 'does not contain' },
  { key: 'is', label: 'is' },
  { key: 'isNot', label: 'is not' },
  { key: 'isEmpty', label: 'is empty' },
  { key: 'isNotEmpty', label: 'is not empty' },
] as const

export type FilterOp = (typeof FILTER_OPS)[number]['key']

/** Column sort, lifted to the page so the toolbar and saved views can set it. */
export type SortState = { key: FilterField; dir: 'asc' | 'desc' }

export type Filter = {
  id: string
  field: FilterField
  op: FilterOp
  value: string
}

/** Ops that stand on their own — the value input is meaningless for them. */
export function needsValue(op: FilterOp) {
  return op !== 'isEmpty' && op !== 'isNotEmpty'
}

/**
 * A half-filled row is inert rather than an error: the panel always shows at
 * least one row, and an empty one must not blank the table.
 */
export function isActive(f: Filter) {
  return !needsValue(f.op) || f.value.trim() !== ''
}

function test(contact: Contact, f: Filter) {
  const raw = contact[f.field]
  const cell = String(raw ?? '').toLowerCase()
  const v = f.value.trim().toLowerCase()

  switch (f.op) {
    case 'contains': return cell.includes(v)
    case 'notContains': return !cell.includes(v)
    case 'is': return cell === v
    case 'isNot': return cell !== v
    /* `null` and '' are both "empty" — the table renders an em-dash for both. */
    case 'isEmpty': return cell === ''
    case 'isNotEmpty': return cell !== ''
  }
}

/** Every active filter must pass — the design joins rows with `and`. */
export function matchesFilters(contact: Contact, filters: Filter[]) {
  return filters.filter(isActive).every((f) => test(contact, f))
}

export function activeCount(filters: Filter[]) {
  return filters.filter(isActive).length
}

let seq = 0
export function newFilter(): Filter {
  seq += 1
  return { id: `f${seq}`, field: 'name', op: 'contains', value: '' }
}
