import { useEffect, useId, useRef, useState } from 'react'
import { cn } from '@/lib/cn'
import {
  AddCleverColumnIcon, AddFormulaColumnIcon, CheckboxIcon, CloseIcon, ContactColumnsIcon,
  DateIcon, FindCompanyDomainIcon, FindCompanyFirmographicsIcon, FindCompanyJobOpeningsIcon,
  FindCompanyNewsIcon, FindCompanyTechnographicsIcon, FindPersonDetailsIcon, FindPhoneNumbersIcon,
  FindWorkEmailIcon, HttpEnrichmentIcon, MultiSelectIcon, NewManualColumnsIcon, NumberIcon,
  SalesforceCreateAccountIcon, SalesforceCreateContactIcon, SalesforceLeadLookupIcon,
  SalesforceUpdateContactIcon, SearchIcon, SelectIcon, UrlIcon, ValidateEmailIcon, ValidatePhoneIcon,
} from './modalIcons'

/* ────────────────────────────────────────────────────────────────────────────
 * Rebuilt from a capture of the live dialog, so the structure and class names
 * follow the real DOM rather than the screenshot.
 *
 * Two deliberate substitutions, both because this app's tokens differ from
 * Rox's under the same name:
 *   • the DOM's `bg-surface` root → `bg-card`. Our `--color-surface` is the
 *     warm grey app background; the dialog's ground is white.
 *   • Tailwind's stock `gray-*` → our warm `os-gray-*` ramp, stepped down one
 *     stop (gray-100 → os-gray-75, gray-200 → os-gray-100) so the active rail
 *     row lands on the ~5% delta measured off the screenshot.
 * ──────────────────────────────────────────────────────────────────────────── */

type Item = {
  label: string
  Icon: typeof SearchIcon
  /** Right-hand count, as shown for enrichments and existing columns. */
  count?: number
  /** The pill rendered by Formula / New clever column. */
  ai?: boolean
}

const SECTIONS: { title: string; items: Item[] }[] = [
  {
    title: 'Create',
    items: [
      { label: 'New manual columns', Icon: NewManualColumnsIcon },
      { label: 'Formula', Icon: AddFormulaColumnIcon, ai: true },
      { label: 'New clever column', Icon: AddCleverColumnIcon, ai: true },
    ],
  },
  {
    title: 'Enrichments',
    items: [
      { label: 'Find Work Email', Icon: FindWorkEmailIcon, count: 2 },
      { label: 'Find Phone Numbers', Icon: FindPhoneNumbersIcon, count: 1 },
      { label: 'Find Person Details', Icon: FindPersonDetailsIcon, count: 28 },
      { label: 'Reverse Email Lookup', Icon: FindPersonDetailsIcon, count: 21 },
      { label: 'Validate Email', Icon: ValidateEmailIcon, count: 1 },
      { label: 'Validate Phone', Icon: ValidatePhoneIcon, count: 1 },
      { label: 'Find Company Firmographics', Icon: FindCompanyFirmographicsIcon, count: 43 },
      { label: 'Find Company Domain', Icon: FindCompanyDomainIcon, count: 1 },
      { label: 'Find Company Technographics', Icon: FindCompanyTechnographicsIcon, count: 1 },
      { label: 'Find Company News', Icon: FindCompanyNewsIcon, count: 2 },
      { label: 'Find Company Job Openings', Icon: FindCompanyJobOpeningsIcon, count: 2 },
      { label: 'HTTP Enrichment', Icon: HttpEnrichmentIcon, count: 2 },
    ],
  },
  {
    title: 'Existing columns',
    items: [
      { label: 'Contact columns', Icon: ContactColumnsIcon, count: 16 },
      { label: 'Account columns', Icon: ContactColumnsIcon, count: 290 },
    ],
  },
  {
    title: 'Salesforce',
    items: [
      { label: 'Salesforce Lead Lookup', Icon: SalesforceLeadLookupIcon },
      { label: 'Salesforce Contact Lookup', Icon: SalesforceLeadLookupIcon },
      { label: 'Salesforce Create Contact', Icon: SalesforceCreateContactIcon },
      { label: 'Salesforce Update Contact', Icon: SalesforceUpdateContactIcon },
      { label: 'Salesforce Account Lookup', Icon: SalesforceLeadLookupIcon },
      { label: 'Salesforce Create Account', Icon: SalesforceCreateAccountIcon },
    ],
  },
]

/** The one pane the capture actually contains. */
const MANUAL = 'New manual columns'

const COLUMN_TYPES: { label: string; Icon: typeof SearchIcon }[] = [
  { label: 'Text', Icon: NewManualColumnsIcon },
  { label: 'Number', Icon: NumberIcon },
  { label: 'Date', Icon: DateIcon },
  { label: 'Checkbox', Icon: CheckboxIcon },
  { label: 'URL', Icon: UrlIcon },
  { label: 'Select', Icon: SelectIcon },
  { label: 'Multi-select', Icon: MultiSelectIcon },
]

/** `Add Clever Column` / `Add Formula Column` — amber glyph in a tinted tile. */
function ShortcutButton({ Icon, children }: { Icon: typeof SearchIcon; children: string }) {
  return (
    <button
      type="button"
      className="border-border-secondary bg-card focus-visible:ring-ring/50 hover:bg-os-gray-75 flex h-8 shrink-0 cursor-pointer items-center gap-1.5 overflow-hidden rounded-lg border py-0 pr-3 pl-1 outline-none focus-visible:ring-2"
    >
      <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-amber-50 ring-1 ring-amber-200/70">
        <Icon className="size-3.5 text-amber-500" />
      </span>
      <span className="text-content-primary text-xs font-medium whitespace-nowrap">{children}</span>
    </button>
  )
}

function AiBadge() {
  return (
    <span className="bg-tertiary text-tertiary-foreground border-border inline-flex h-4 shrink-0 items-center rounded-full border px-1 text-[10px] font-medium">
      AI
    </span>
  )
}

export function AddColumnModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [source, setSource] = useState(MANUAL)
  const [query, setQuery] = useState('')
  const [picked, setPicked] = useState<Set<string>>(new Set())
  const titleId = useId()
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    searchRef.current?.focus()
    /* The page behind must not scroll while the dialog owns the viewport. */
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null

  const q = query.trim().toLowerCase()
  const sections = SECTIONS
    .map((s) => ({ ...s, items: s.items.filter((i) => i.label.toLowerCase().includes(q)) }))
    .filter((s) => s.items.length > 0)

  const types = COLUMN_TYPES.filter((t) => t.label.toLowerCase().includes(q))

  function togglePick(label: string) {
    setPicked((cur) => {
      const next = new Set(cur)
      if (next.has(label)) next.delete(label)
      else next.add(label)
      return next
    })
  }

  return (
    <div className="fixed inset-0 z-50">
      {/* Scrim. The capture shows the page blurred behind the dialog. */}
      <div
        className="absolute inset-0 bg-os-gray-950/20 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="bg-card ring-foreground/10 pointer-events-auto fixed top-1/2 left-1/2 flex h-[640px] max-h-[88vh] w-full max-w-4xl -translate-x-1/2 -translate-y-1/2 flex-col gap-0 overflow-hidden rounded-xl p-0 ring-1 outline-none"
      >
        <div className="border-border-secondary grid shrink-0 gap-1.5 border-b px-5 py-4 pr-12">
          <h2 id={titleId} className="text-base font-medium">Add column</h2>
        </div>

        <div className="border-border-secondary bg-os-gray-50 shrink-0 border-b px-5 pt-4 pb-3">
          <div className="border-input bg-input-background focus-within:border-ring focus-within:ring-ring/50 relative flex h-8 w-full min-w-0 items-center rounded-lg border transition-colors outline-none focus-within:ring-[3px]">
            <span className="text-muted-foreground flex cursor-text items-center justify-center pl-2 select-none">
              <SearchIcon />
            </span>
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search fields and existing columns, try “work email”, “employee count”…"
              className="placeholder:text-content-placeholder h-8 w-full min-w-0 flex-1 rounded-none border-0 bg-transparent px-2.5 py-1 text-sm shadow-none outline-none"
            />
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            <ShortcutButton Icon={AddCleverColumnIcon}>Add Clever Column</ShortcutButton>
            <ShortcutButton Icon={AddFormulaColumnIcon}>Add Formula Column</ShortcutButton>
          </div>
        </div>

        <div className="flex min-h-0 flex-1">
          <nav
            aria-label="Column sources"
            className="border-border-secondary bg-os-gray-50 flex w-56 shrink-0 flex-col gap-0.5 overflow-y-auto border-r p-2"
          >
            {sections.map((section) => (
              <div key={section.title} className="contents">
                <span className="text-content-tertiary px-3 pt-3 pb-1 text-xs font-medium tracking-wide uppercase first:pt-1">
                  {section.title}
                </span>
                {section.items.map((item) => {
                  const active = item.label === source
                  return (
                    <button
                      key={item.label}
                      type="button"
                      aria-current={active ? 'true' : undefined}
                      onClick={() => setSource(item.label)}
                      className={cn(
                        'group/source focus-visible:ring-ring/50 relative flex w-full cursor-pointer items-center',
                        'gap-2 rounded-lg px-3 py-1.5 text-left text-sm transition-colors outline-none',
                        'focus-visible:ring-2',
                        active
                          ? 'text-content-primary bg-os-gray-100/70 font-medium'
                          : 'text-content-secondary hover:bg-os-gray-100/60',
                      )}
                    >
                      {active && (
                        <span
                          aria-hidden="true"
                          className="bg-content-primary absolute top-1/2 left-0 h-4 w-0.5 -translate-y-1/2 rounded-full"
                        />
                      )}
                      <item.Icon className="text-content-tertiary" />
                      <span className="min-w-0 flex-1 truncate">{item.label}</span>
                      {item.ai && <AiBadge />}
                      {item.count !== undefined && (
                        <span className="text-content-tertiary shrink-0 text-xs tabular-nums">
                          {item.count}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            ))}
            {sections.length === 0 && (
              <p className="text-content-tertiary px-3 py-2 text-sm">No sources match “{query}”.</p>
            )}
          </nav>

          <div className="bg-card min-h-0 flex-1 overflow-y-auto">
            <div className="flex flex-col">
              <div className="bg-card border-border-secondary sticky top-0 z-10 border-b px-5 py-3">
                <h3 className="text-content-primary text-sm font-semibold">{source}</h3>
                <p className="text-content-tertiary mt-0.5 text-xs">
                  {source === MANUAL
                    ? 'A blank column you fill in yourself. Pick a type to add it.'
                    : 'Select the fields you want to bring into the table.'}
                </p>
              </div>

              {source === MANUAL ? (
                <div className="flex flex-col p-2">
                  {types.map(({ label, Icon }) => {
                    const on = picked.has(label)
                    return (
                      <button
                        key={label}
                        type="button"
                        aria-pressed={on}
                        onClick={() => togglePick(label)}
                        className={cn(
                          'focus-visible:ring-ring/50 flex cursor-pointer items-center gap-3 rounded-lg',
                          'px-3 py-2 text-left transition-colors outline-none focus-visible:ring-2',
                          on ? 'bg-accent-select/5' : 'hover:bg-os-gray-75',
                        )}
                      >
                        <Icon className={on ? 'text-accent-select' : 'text-content-tertiary'} />
                        <span className="text-content-primary min-w-0 flex-1 truncate text-sm">
                          {label}
                        </span>
                      </button>
                    )
                  })}
                  {types.length === 0 && (
                    <p className="text-content-tertiary px-3 py-2 text-sm">
                      No column types match “{query}”.
                    </p>
                  )}
                </div>
              ) : (
                /* The capture only contains the manual-columns pane, so the
                   other sources intentionally render nothing rather than
                   inventing fields Rox may not have. */
                <p className="text-content-tertiary px-5 py-6 text-sm">
                  Fields for {source} are not part of the captured state.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="border-border-secondary flex shrink-0 items-center justify-between gap-3 border-t px-5 py-3">
          <div className="text-content-tertiary min-w-0 truncate text-sm">
            {picked.size === 0
              ? 'Select fields or existing columns to add'
              : `${picked.size} selected`}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-secondary text-secondary-foreground hover:bg-secondary-hover focus-visible:ring-ring/50 inline-flex h-[36px] shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-transparent px-2.5 text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:ring-[3px]"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={picked.size === 0}
              className="bg-button text-foreground border-button-border shadow-button not-disabled:hover:bg-button-hover not-disabled:hover:border-button-border-hover focus-visible:ring-ring/50 inline-flex h-[36px] shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-2.5 text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Add columns
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="hover:bg-overlay-secondary hover:text-foreground focus-visible:ring-ring/50 absolute top-3 right-3 inline-flex size-[30px] cursor-pointer items-center justify-center rounded-[min(var(--radius-md),12px)] border border-transparent shadow-none transition-all outline-none focus-visible:ring-[3px]"
        >
          <CloseIcon />
        </button>
      </div>
    </div>
  )
}
