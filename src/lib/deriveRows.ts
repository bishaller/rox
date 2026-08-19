import type { Contact } from '@/data/contacts'
import { type Filter, type FilterJoin, type SortState, matchesFilters } from '@/lib/filters'

/** Fields the search box matches against. */
const SEARCHABLE: (keyof Contact)[] = [
  'name', 'title', 'email', 'companyName', 'companyDomain', 'linkedinUrl', 'department',
]

/** Empty values always sort last, regardless of direction. */
function compare(a: Contact, b: Contact, key: SortState['key']) {
  const x = a[key]
  const y = b[key]
  if (x === y) return 0
  if (x == null) return 1
  if (y == null) return -1
  return String(x).localeCompare(String(y), undefined, { sensitivity: 'base' })
}

/**
 * The table's visible rows: filters narrow the set, search narrows it again,
 * sort orders what is left. Extracted from DataTable so the page can know
 * what is visible — the enrichment trial runs on the first rows the user can
 * actually see.
 */
export function deriveRows(
  source: Contact[],
  { query, filters, sort, join = 'and' }: {
    query: string; filters: Filter[]; sort: SortState | null; join?: FilterJoin
  },
): Contact[] {
  const q = query.trim().toLowerCase()
  const matched = filters.length ? source.filter((c) => matchesFilters(c, filters, join)) : source
  const filtered = q
    ? matched.filter((c) =>
        SEARCHABLE.some((k) => String(c[k] ?? '').toLowerCase().includes(q)))
    : matched
  if (!sort) return filtered
  const factor = sort.dir === 'asc' ? 1 : -1
  return [...filtered].sort((a, b) => compare(a, b, sort.key) * factor)
}
