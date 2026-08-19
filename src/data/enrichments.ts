import type { Contact } from './contacts'

/**
 * The enrichment-flow prototype's canned catalogue — six enrichments carried
 * over from the reference flow, each fully wired: providers, matching pills,
 * expandable fields, and a deterministic per-contact result.
 */

export type ProviderName = 'Apollo' | 'Hunter' | 'Clearbit' | 'NeverBounce' | 'Twilio'

export type EnrichmentId =
  | 'work_email' | 'phone' | 'person_details'
  | 'reverse_email' | 'validate_email' | 'validate_phone'

/** A field the enrichment fetched that can be pulled out as its own column. */
export type EnrichField = { key: string; label: string; fill: number }

export type MatchPill = { tone: 'ok' | 'add' | 'warn'; label: string; pct?: string }

export type EnrichResult = {
  value: string
  source: ProviderName
  fields: Record<string, string>
}

export type EnrichmentDef = {
  id: EnrichmentId
  /** Popover row label. */
  name: string
  /** Header of the column the enrichment lands in the table. */
  columnLabel: string
  providers: ProviderName[]
  matching: MatchPill[]
  matchHint?: string
  fields: EnrichField[]
}

export const ENRICH_COL_WIDTH = 230
export const FIELD_COL_WIDTH = 170
export const TRIAL_SIZE = 10
/** The fictional size of the full book, as in the reference flow. */
export const FULL_COUNT = 2340

export const ENRICHMENTS: EnrichmentDef[] = [
  {
    id: 'work_email',
    name: 'Find work email',
    columnLabel: 'Found email',
    providers: ['Apollo', 'Hunter'],
    matching: [{ tone: 'ok', label: 'Name + Company domain', pct: '96% filled' }],
    fields: [
      { key: 'status', label: 'Email status', fill: 100 },
      { key: 'conf', label: 'Confidence', fill: 100 },
    ],
  },
  {
    id: 'phone',
    name: 'Find phone numbers',
    columnLabel: 'Phone',
    providers: ['Apollo'],
    matching: [{ tone: 'ok', label: 'LinkedIn URL', pct: '100% filled' }],
    matchHint: 'Phone coverage is thinner than email everywhere — expect gaps.',
    fields: [
      { key: 'type', label: 'Phone type', fill: 100 },
      { key: 'country', label: 'Country', fill: 100 },
    ],
  },
  {
    id: 'person_details',
    name: 'Find person details',
    columnLabel: 'Person details',
    providers: ['Apollo', 'Hunter', 'Clearbit'],
    matching: [
      { tone: 'ok', label: 'LinkedIn URL', pct: '100% filled' },
      { tone: 'add', label: '+ Company', pct: '96% filled' },
    ],
    matchHint: "Name is empty for every contact, so it's skipped.",
    fields: [
      { key: 'title', label: 'Title', fill: 94 },
      { key: 'web', label: 'Company website', fill: 98 },
      { key: 'loc', label: 'Location', fill: 87 },
      { key: 'head', label: 'Headline', fill: 71 },
      { key: 'conn', label: 'Connections', fill: 62 },
      { key: 'fol', label: 'Followers', fill: 62 },
      { key: 'jobs', label: 'Jobs count', fill: 41 },
      { key: 'slug', label: 'Slug', fill: 100 },
    ],
  },
  {
    id: 'reverse_email',
    name: 'Reverse email lookup',
    columnLabel: 'Person (from email)',
    providers: ['Clearbit'],
    matching: [{ tone: 'ok', label: 'Work Email', pct: '83% filled' }],
    matchHint: 'Contacts with no email are skipped, not charged.',
    fields: [
      { key: 'title', label: 'Title', fill: 90 },
      { key: 'loc', label: 'Location', fill: 80 },
    ],
  },
  {
    id: 'validate_email',
    name: 'Validate email',
    columnLabel: 'Email status',
    providers: ['NeverBounce'],
    matching: [{ tone: 'ok', label: 'Work Email', pct: '83% filled' }],
    matchHint: 'Contacts with no email are skipped, not charged.',
    fields: [
      { key: 'score', label: 'Score', fill: 100 },
      { key: 'reason', label: 'Reason', fill: 100 },
    ],
  },
  {
    id: 'validate_phone',
    name: 'Validate phone',
    columnLabel: 'Phone status',
    providers: ['Twilio'],
    matching: [{ tone: 'warn', label: 'No phone column found' }],
    matchHint: 'This enrichment needs a phone number to validate. Run Find phone numbers first.',
    fields: [
      { key: 'line', label: 'Line type', fill: 0 },
      { key: 'carrier', label: 'Carrier', fill: 0 },
    ],
  },
]

export function enrichmentById(id: EnrichmentId): EnrichmentDef {
  return ENRICHMENTS.find((e) => e.id === id)!
}

/** Popover Create rows — toast stubs in this prototype. */
export const CREATE_ITEMS = ['Clever column', 'Text column', 'Number column', 'Formula'] as const

export type ExistingField = {
  name: string
  object: 'Contact' | 'Account'
  /** Seed visibility only; live state is a Set owned by the page. */
  shown: boolean
  /** Sync-source chip, only when it isn't the native CRM default. */
  source?: string
}

export const existingKey = (f: Pick<ExistingField, 'name' | 'object'>) => `${f.object}:${f.name}`

export const EXISTING_FIELDS: ExistingField[] = [
  { name: 'Associated opportunities', object: 'Contact', shown: true },
  { name: 'Country', object: 'Contact', shown: true },
  { name: 'CRM ID', object: 'Contact', shown: true, source: 'Salesforce' },
  { name: 'CRM last modified on', object: 'Contact', shown: true, source: 'Salesforce' },
  { name: 'First name', object: 'Contact', shown: true },
  { name: 'Last name', object: 'Contact', shown: true },
  { name: 'Last email', object: 'Contact', shown: false },
  { name: 'Last meeting', object: 'Contact', shown: false },
  { name: 'Lifecycle stage', object: 'Contact', shown: true },
  { name: 'Lead source', object: 'Contact', shown: false, source: 'HubSpot' },
  { name: 'Mobile phone', object: 'Contact', shown: false },
  { name: 'Owner', object: 'Contact', shown: true },
  { name: 'Seniority', object: 'Contact', shown: true },
  { name: 'Department', object: 'Contact', shown: false },
  { name: 'Time zone', object: 'Contact', shown: false },
  { name: 'Do not contact', object: 'Contact', shown: true },
  { name: 'Associated opportunities', object: 'Account', shown: true },
  { name: 'Billing city', object: 'Account', shown: false },
  { name: 'Billing country', object: 'Account', shown: false },
  { name: 'Billing postal code', object: 'Account', shown: false },
  { name: 'Billing state', object: 'Account', shown: false },
  { name: 'Billing street', object: 'Account', shown: false },
  { name: 'CRM last modified on', object: 'Account', shown: true, source: 'Salesforce' },
  { name: 'Current head count', object: 'Account', shown: true },
  { name: 'Current stage', object: 'Account', shown: true },
  { name: 'Annual revenue', object: 'Account', shown: false },
  { name: 'Industry', object: 'Account', shown: true },
  { name: 'Founded year', object: 'Account', shown: false },
  { name: 'Parent account', object: 'Account', shown: false },
  { name: 'Account owner', object: 'Account', shown: true },
  { name: 'Renewal date', object: 'Account', shown: false },
  { name: 'Contract value', object: 'Account', shown: false },
  { name: 'Employee range', object: 'Account', shown: false },
  { name: 'Tech stack', object: 'Account', shown: false, source: 'Clearbit' },
  { name: 'Website', object: 'Account', shown: true },
  { name: 'Ticker', object: 'Account', shown: false },
]

/* ───────────────────────── deterministic results ─────────────────────────
   Hashed from the contact id + enrichment id, the same shape as the AI
   column's `categorize()`: a given contact always resolves to the same
   result, so a re-trial never reshuffles — which would read as a bug. */

function hash(s: string) {
  let h = 0
  for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return h
}

const CITIES = [
  'San Francisco, CA', 'New York, NY', 'Austin, TX', 'Charlotte, NC',
  'Toronto, ON', 'London, UK', 'Seattle, WA', 'Denver, CO',
]

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '')
}

function nameParts(name: string): [string, string] {
  const parts = name.trim().toLowerCase().split(/\s+/)
  return [parts[0] ?? 'contact', parts[parts.length - 1] ?? 'person']
}

/**
 * What the enrichment "found" for a contact — or null for a no-match.
 * ~15% of contacts miss; `validate_phone` always misses (there is no phone
 * column to validate — the reference's teaching state). The source is the
 * first provider most of the time, so reordering the waterfall in Adjust
 * visibly changes the chips on a re-trial.
 */
export function resultFor(
  def: EnrichmentDef, contact: Contact, providers: ProviderName[],
): EnrichResult | null {
  if (def.id === 'validate_phone') return null
  const h = hash(`${contact.id}:${def.id}`)
  if (h % 100 < 15) return null
  if ((def.id === 'reverse_email' || def.id === 'validate_email') && !contact.email) return null

  const source = providers[(h >> 3) % 10 < 7 ? 0 : h % providers.length]
  /** Honours a field's advertised fill rate, per contact. */
  const fv = (key: string, fill: number, value: string) =>
    hash(`${contact.id}:${key}`) % 100 < fill ? value : ''

  const title = contact.title ?? 'Member of staff'
  const company = contact.companyName ?? contact.companyDomain ?? 'their company'
  const domain = contact.companyDomain ?? `${slugify(contact.companyName ?? 'example')}.com`
  const [first, last] = nameParts(contact.name)

  switch (def.id) {
    case 'work_email':
      return {
        value: contact.email ?? `${first}.${last}@${domain}`,
        source,
        fields: {
          status: h % 5 === 0 ? 'Catch-all' : 'Deliverable',
          conf: String(85 + (h % 14)),
        },
      }
    case 'phone':
      return {
        value: `+1 ${415 + (h % 500)} 555 01${String(h % 100).padStart(2, '0')}`,
        source,
        fields: { type: h % 2 ? 'Mobile' : 'Work', country: 'US' },
      }
    case 'person_details':
      return {
        value: `${title} · ${company}`,
        source,
        fields: {
          title: fv('title', 94, title),
          web: fv('web', 98, domain),
          loc: fv('loc', 87, CITIES[h % CITIES.length]),
          head: fv('head', 71, `${title} at ${company}`),
          conn: fv('conn', 62, h % 3 ? '500+' : String(120 + (h % 380))),
          fol: fv('fol', 62, (200 + (h % 4000)).toLocaleString()),
          jobs: fv('jobs', 41, String(2 + (h % 7))),
          slug: contact.linkedinUrl?.split('/').pop() ?? slugify(contact.name),
        },
      }
    case 'reverse_email':
      return {
        value: `${contact.name} · ${title}`,
        source,
        fields: {
          title: fv('title', 90, title),
          loc: fv('loc', 80, CITIES[h % CITIES.length]),
        },
      }
    case 'validate_email': {
      const status = (['Valid', 'Valid', 'Valid', 'Catch-all', 'Invalid'] as const)[h % 5]
      const detail = {
        Valid: { score: `0.9${h % 9}`, reason: 'Mailbox verified' },
        'Catch-all': { score: `0.6${h % 9}`, reason: 'Domain accepts all' },
        Invalid: { score: `0.1${h % 9}`, reason: 'Mailbox not found' },
      }[status]
      return { value: status, source, fields: detail }
    }
  }
  return null
}
