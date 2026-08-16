import { cn } from '@/lib/cn'
import { EllipsisIcon, PeopleIcon, PlusIcon } from './icons'

/** Saved views. `shared` ones carry the people glyph, as in the design. */
const VIEWS: { label: string; shared?: boolean }[] = [
  { label: 'Default' },
  { label: 'New view' },
  { label: 'Philips RHT Sales Play', shared: true },
  { label: 'Test-alexh-orgwide', shared: true },
  { label: 'Customer onboarding dashboard', shared: true },
  { label: '[DCG] Datacenter Goldrush Sales Play', shared: true },
  { label: '[DCG] Datacenter Goldrush Sales Play', shared: true },
  { label: '[DCG] Datacenter Goldrush Sales Play', shared: true },
]

/**
 * A view tab.
 *
 * The options menu is overlaid rather than inserted into the flex row, so
 * revealing it on hover cannot change the pill's width and shove the rest of
 * the strip sideways. A gradient fades the label out beneath it, which is what
 * produces the truncated "New v…" look in the design.
 *
 * The pill is a `div role="button"` rather than a `<button>` because it
 * contains a real button — nesting buttons is invalid HTML. The live Rox DOM
 * uses the same pattern for its pills.
 */
function Tab({ label, shared, active }: { label: string; shared?: boolean; active?: boolean }) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-current={active ? 'true' : undefined}
      className={cn(
        'group/tab relative flex h-[32px] max-w-[210px] shrink-0 cursor-pointer items-center',
        'gap-1.5 overflow-hidden rounded-full px-3.5 text-[14px] whitespace-nowrap',
        'transition-colors outline-none select-none',
        'focus-visible:ring-ring/50 focus-visible:ring-[3px]',
        active
          ? 'bg-tab-active font-medium text-white'
          : 'border-button-border text-content-primary border bg-white',
      )}
    >
      {shared && (
        <PeopleIcon className={cn('shrink-0', active ? 'text-white/70' : 'text-content-tertiary')} />
      )}

      {/* Truncates against the pill's max-width only — the menu is out of flow. */}
      <span className="min-w-0 truncate">{label}</span>

      {/* Gradient sits immediately left of the menu, softening the cut. */}
      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-y-0 right-[26px] hidden w-6 bg-gradient-to-r',
          'from-transparent group-hover/tab:block',
          active ? 'to-tab-active' : 'to-white',
        )}
      />

      {/* Absolutely positioned, and always mounted. In flow it took real width,
          which grew the pill on hover for any label short enough not to be
          truncated — the strip visibly shifted under the cursor. Out of flow it
          cannot affect the pill's width at all; the gradient above masks the
          label it overlaps. */}
      <button
        type="button"
        aria-label={`Options for ${label}`}
        className={cn(
          'focus-visible:ring-ring/50 absolute top-1/2 right-1.5 flex size-5 shrink-0',
          '-translate-y-1/2 cursor-pointer items-center justify-center rounded outline-none',
          'pointer-events-none opacity-0 transition-opacity duration-150',
          'group-hover/tab:pointer-events-auto group-hover/tab:opacity-100',
          'focus-visible:pointer-events-auto focus-visible:opacity-100 focus-visible:ring-[3px]',
          active ? 'text-white' : 'text-content-primary',
        )}
      >
        <EllipsisIcon className="size-4" />
      </button>
    </div>
  )
}

export function ViewTabs() {
  return (
    <div className="relative flex shrink-0 items-center px-4">
      <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden">
        {VIEWS.map((v, i) => (
          <Tab key={`${v.label}-${i}`} label={v.label} shared={v.shared} active={i === 0} />
        ))}
      </div>

      {/* Fade the strip's own overflow into the panel before the pinned + */}
      <div aria-hidden="true"
        className="pointer-events-none absolute top-0 right-[52px] h-full w-16 bg-gradient-to-r from-transparent to-white" />

      <button type="button" aria-label="Add view"
        className="text-content-tertiary hover:bg-os-gray-100 focus-visible:ring-ring/50 ml-2 flex size-[32px] shrink-0 cursor-pointer items-center justify-center rounded-md outline-none focus-visible:ring-[3px]">
        <PlusIcon />
      </button>
    </div>
  )
}
