import { useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'
import { ContextMenu, type MenuAnchor } from './ContextMenu'
import { Tooltip } from '@/components/ui/tooltip'
import { ChevronDownIcon, PeopleIcon, PlusIcon } from './icons'
import { CreateViewModal } from './CreateViewModal'
import avatarBen from '@/assets/avatar-ben.png'
import avatarBishal from '@/assets/avatar-bishal.png'
import { type Filter, newFilter, type SortState } from '@/lib/filters'

export type View = {
  id: string
  label: string
  shared?: boolean
  /**
   * The 16px round mark a view carries when it belongs to someone. The frame
   * shows photo avatars on two of these; those are Figma placeholder headshots,
   * so they render here with the same letter treatment it already uses for
   * `Engineers` rather than committing stock photography.
   */
  /** `src` wins over the lettermark when the sharer has a real photo. */
  avatar?: { initial: string; tone?: string; src?: string; sharedBy: string }
  /** What the view shows: applied to the table when the view is selected. */
  filters?: Filter[]
  query?: string
  sort?: SortState | null
}

/** A seed filter row. */
function vf(field: Filter['field'], op: Filter['op'], value = ''): Filter {
  return { ...newFilter(), field, op, value }
}

/**
 * Saved views, as in the frame — five, none of them shared. `shared` is kept on
 * the type because the pill still renders the people glyph for it, and real Rox
 * views can be shared; no seed view uses it.
 *
 * Ids are carried explicitly rather than using position — the list is mutable,
 * so duplicating or deleting reshuffles indices, and a duplicate's label is by
 * definition close to its source's.
 */
const VIEWS: View[] = [
  { id: 'default', label: 'Default' },
  { id: 'old', label: 'Old View',
    filters: [vf('title', 'contains', 'Vice President')], sort: { key: 'name', dir: 'asc' } },
  { id: 'designers', label: 'Designers',
    avatar: { initial: 'B', src: avatarBen, sharedBy: 'Ben' },
    filters: [vf('title', 'contains', 'Design')] },
  { id: 'designers-2', label: 'Designers',
    avatar: { initial: 'B', src: avatarBishal, sharedBy: 'Bishal' },
    filters: [vf('title', 'contains', 'Designer')], sort: { key: 'companyName', dir: 'asc' } },
  { id: 'engineers', label: 'Engineers',
    avatar: { initial: 'A', sharedBy: 'Anna' },
    filters: [vf('department', 'is', 'Engineering')] },
  { id: 'new', label: 'New View' },
  { id: 'dcg', label: 'Datacenter Goldrush Sales Play',
    filters: [vf('companyName', 'is', 'KBR')], sort: { key: 'title', dir: 'asc' } },
  { id: 'q3', label: 'Q3 Pipeline',
    filters: [vf('department', 'is', 'Sales')] },
  { id: 'churn', label: 'Churn Risks',
    filters: [vf('linkedinUrl', 'isEmpty')] },
]

/** Wraps children in the shared-by tooltip only when there is someone to name. */
function MaybeTooltip({ label, children }: { label?: string | false; children: React.ReactNode }) {
  if (!label) return <>{children}</>
  return <Tooltip label={label} className="min-w-0">{children}</Tooltip>
}

/**
 * A view tab.
 *
 * Rename and delete are reached by right-clicking the pill; there is no hover
 * affordance for them. Shift+F10 and the context-menu key open the same menu,
 * which is the only route for anyone not using a mouse.
 *
 * The max-width is a safety net for pathological labels, not a design value —
 * every pill in the frame sizes to its content and it is the strip that clips.
 *
 * Still a `div role="button"` rather than a `<button>`: it hosts an `<input>`
 * while renaming, and the live Rox DOM uses the same pattern for its pills.
 */
function Tab({
  view, active, renaming, onSelect, onMenu, onRename, onRenameEnd,
}: {
  view: View
  active?: boolean
  renaming?: boolean
  onSelect: () => void
  /** Opens the options menu at a point in viewport coordinates. */
  onMenu: (at: MenuAnchor) => void
  onRename: (label: string) => void
  onRenameEnd: () => void
}) {
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (renaming) input.current?.select()
  }, [renaming])

  function commit() {
    const next = input.current?.value.trim()
    /* An empty name would leave an unclickable pill, so treat it as a cancel. */
    if (next) onRename(next)
    onRenameEnd()
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-current={active ? 'true' : undefined}
      onClick={() => !renaming && onSelect()}
      onKeyDown={(e) => {
        if (renaming) return
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect() }
        /* The keyboard route to the same menu, for anyone not using a mouse. */
        if (e.key === 'ContextMenu' || (e.shiftKey && e.key === 'F10')) {
          e.preventDefault()
          const r = e.currentTarget.getBoundingClientRect()
          onMenu({ x: r.left, y: r.bottom + 6 })
        }
      }}
      onContextMenu={(e) => {
        e.preventDefault()
        onMenu({ x: e.clientX, y: e.clientY })
      }}
      className={cn(
        'group relative flex h-[32px] max-w-[300px] shrink-0 cursor-pointer items-center',
        'gap-1.5 overflow-hidden rounded-full border px-2.5 text-[14px] whitespace-nowrap',
        'outline-none select-none',
        'transition-[background-color,border-color,color] duration-150 ease-out-strong',
        'focus-visible:ring-ring/50 focus-visible:ring-[3px]',
        /* The border is always present and only its colour changes: dropping it
           on the active pill made the pill 2px narrower, which shifted every
           pill after it. */
        active
          ? 'border-stone-400 bg-stone-200 font-medium text-stone-800'
          : 'border-stone-200 bg-white text-stone-800',
      )}
    >
      {/* Everything inside the pill takes the press together — avatar and
          label as one piece; only the chrome holds still. Scale does not
          affect layout, so nothing beside the pill reflows.
          Shared views carry the Shared-by tooltip on the whole pill — the
          16px avatar alone was too small a target to ever find it. */}
      <MaybeTooltip label={view.avatar && `Shared by ${view.avatar.sharedBy}`}>
      <span className={cn(
        'flex min-w-0 items-center gap-1.5 origin-center',
        'transition-transform duration-150 ease-out-strong group-active:scale-[0.97]',
      )}>
      {view.shared && (
        <PeopleIcon className={cn('shrink-0', active ? 'text-stone-600' : 'text-stone-400')} />
      )}

      {view.avatar && (
        view.avatar.src ? (
          <img
            src={view.avatar.src}
            alt={`Shared by ${view.avatar.sharedBy}`}
            className="size-4 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span
            aria-label={`Shared by ${view.avatar.sharedBy}`}
            className={cn(
              'flex size-4 shrink-0 items-center justify-center rounded-full',
              'text-[11px] leading-none font-medium text-white',
              view.avatar.tone ?? 'bg-blue-400',
            )}
          >
            {view.avatar.initial}
          </span>
        )
      )}

      {renaming ? (
        /* Sized in `ch` off the current label: the pill hugs its content, so an
           input with no intrinsic width would collapse it to nothing. */
        <input
          ref={input}
          defaultValue={view.label}
          aria-label={`Rename ${view.label}`}
          style={{ width: `${Math.max(view.label.length, 8)}ch` }}
          onClick={(e) => e.stopPropagation()}
          onBlur={commit}
          onKeyDown={(e) => {
            e.stopPropagation()
            if (e.key === 'Enter') commit()
            if (e.key === 'Escape') onRenameEnd()
          }}
          className="min-w-0 bg-transparent text-[14px] outline-none"
        />
      ) : (
        /* Sized by a hidden 500-weight copy, so selecting a view changes its
           weight without changing its width. */
        <span className="text-steady" data-text={view.label}>
          <span className="block truncate">
            {view.label}
          </span>
        </span>
      )}
      </span>
      </MaybeTooltip>
    </div>
  )
}

/** Pills past this count collapse into the More dropdown. */
const MAX_VISIBLE = 4

export type ViewTabsProps = {
  /** What the table is currently showing — the Create-view dialog plays these
      back as the new view's captured definition. */
  filters?: Filter[]
  query?: string
  sort?: SortState | null
  /** Selecting a view hands its definition to the page, which owns the table state. */
  onApply?: (view: View) => void
}

export function ViewTabs({ filters = [], query = '', sort = null, onApply }: ViewTabsProps) {
  const [views, setViews] = useState(VIEWS)
  const [activeId, setActiveId] = useState(VIEWS[0].id)
  const [menu, setMenu] = useState<{ id: string; at: MenuAnchor } | null>(null)
  const [moreMenu, setMoreMenu] = useState<MenuAnchor | null>(null)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const moreButton = useRef<HTMLButtonElement>(null)
  const copies = useRef(0)

  const closeMenu = useCallback(() => setMenu(null), [])
  const closeMore = useCallback(() => setMoreMenu(null), [])
  const closeCreate = useCallback(() => setCreating(false), [])

  function rename(id: string, label: string) {
    setViews((current) => current.map((v) => (v.id === id ? { ...v, label } : v)))
  }

  /**
   * "Old View" → "Old View copy" → "Old View copy 2", …
   *
   * A copy that reads identically to the pill beside it is indistinguishable,
   * so copies are numbered even though labels are not unique in general.
   */
  function copyLabel(label: string, taken: View[]) {
    const names = new Set(taken.map((v) => v.label))
    if (!names.has(`${label} copy`)) return `${label} copy`
    let n = 2
    while (names.has(`${label} copy ${n}`)) n += 1
    return `${label} copy ${n}`
  }

  function duplicate(id: string) {
    setViews((current) => {
      const at = current.findIndex((v) => v.id === id)
      const source = current[at]
      /* A counter rather than an index-derived id: ids have to stay unique
         across any sequence of duplicates and deletes, and positions reshuffle. */
      copies.current += 1
      const copy: View = {
        ...source,
        id: `${source.id}-copy-${copies.current}`,
        label: copyLabel(source.label, current),
      }
      /* Lands immediately after its source, where the eye already is. */
      return [...current.slice(0, at + 1), copy, ...current.slice(at + 1)]
    })
  }

  function createView(label: string, captured: Filter[]) {
    copies.current += 1
    /* The dialog seeds from the current table but is editable — what it hands
       back is the definition, so the new view shows exactly what it promised. */
    const view: View = { id: `view-${copies.current}`, label, filters: captured, query, sort }
    setViews((current) => [...current, view])
    setActiveId(view.id)
    /* The table follows: creating a view lands the user inside it. */
    onApply?.(view)
  }

  function select(view: View) {
    setActiveId(view.id)
    onApply?.(view)
  }

  function remove(id: string) {
    /* An empty strip has no way back — the + only creates from current state. */
    if (views.length === 1) return
    const at = views.findIndex((v) => v.id === id)
    const next = views.filter((v) => v.id !== id)
    setViews(next)
    /* Deleting the open view hands selection to its neighbour rather than
       leaving the strip with nothing marked current — and shows that view. */
    if (id === activeId) select(next[Math.min(at, next.length - 1)])
  }

  const target = menu && views.find((v) => v.id === menu.id)

  /* The strip holds MAX_VISIBLE pills; everything after collapses into the
     More dropdown. Selecting an overflow view does not promote it — the
     order is the user's, not recency's. */
  const visible = views.slice(0, MAX_VISIBLE)
  const overflow = views.slice(MAX_VISIBLE)
  const overflowActive = overflow.some((v) => v.id === activeId)

  return (
    /* No horizontal padding of its own any more: the tabs and the toolbar share
       one 48px row, and the page's row wrapper owns the gutter.
       Hugs its pills rather than filling the row — `flex-1` here stretched the
       strip to the toolbar and carried the + away with it. */
    <div className="relative flex min-w-0 shrink items-center">
      <div className="flex min-w-0 flex-1 items-center gap-1 overflow-hidden">
        {visible.map((v) => (
          <Tab
            key={v.id}
            view={v}
            active={v.id === activeId}
            renaming={renamingId === v.id}
            onSelect={() => select(v)}
            onMenu={(at) => setMenu({ id: v.id, at })}
            onRename={(label) => rename(v.id, label)}
            onRenameEnd={() => setRenamingId(null)}
          />
        ))}
      </div>

      {overflow.length > 0 && (
        <button
          ref={moreButton}
          type="button"
          aria-label={`${overflow.length} more views`}
          aria-haspopup="menu"
          aria-expanded={moreMenu !== null}
          onClick={() => {
            if (moreMenu) return closeMore()
            const r = moreButton.current?.getBoundingClientRect()
            if (r) setMoreMenu({ x: r.left, y: r.bottom + 6 })
          }}
          className={cn(
            /* Node 3774:3605: a pill like the tabs — `N more` with a chevron,
               12px in, 10px out. */
            'focus-visible:ring-ring/50 ml-1 flex h-[32px] shrink-0 cursor-pointer items-center',
            'gap-1 rounded-full border pr-[10px] pl-3 text-[14px] outline-none',
            'transition-[background-color,border-color,transform] duration-150 ease-out-strong',
            'active:scale-[0.97] focus-visible:ring-[3px]',
            /* Carries the active look when the open view lives inside it, so
               selection never disappears from the strip. */
            overflowActive || moreMenu
              ? 'border-stone-400 bg-stone-200 text-stone-800'
              : 'border-stone-200 bg-white text-stone-800 hover:bg-stone-100',
          )}
        >
          {overflow.length} more
          <ChevronDownIcon className="size-4 text-stone-400" />
        </button>
      )}

      <button type="button" aria-label="Add view" aria-haspopup="dialog"
        onClick={() => setCreating(true)}
        className="focus-visible:ring-ring/50 ml-1 flex size-[32px] shrink-0 cursor-pointer items-center justify-center rounded-full text-stone-600 outline-none transition-[background-color,transform] duration-150 ease-out-strong hover:bg-stone-100 active:scale-[0.95] focus-visible:ring-[3px]">
        <PlusIcon className="size-3.5" />
      </button>

      <CreateViewModal
        open={creating}
        onClose={closeCreate}
        onCreate={createView}
        filters={filters}
        query={query}
        sort={sort}
      />

      {moreMenu && (
        <ContextMenu
          anchor={moreMenu}
          onClose={closeMore}
          items={overflow.map((v) => ({
            label: v.label,
            onSelect: () => select(v),
          }))}
        />
      )}

      {target && (
        <ContextMenu
          anchor={menu.at}
          onClose={closeMenu}
          items={[
            { label: 'Rename', onSelect: () => setRenamingId(target.id) },
            { label: 'Duplicate', onSelect: () => duplicate(target.id) },
            {
              label: 'Delete',
              tone: 'destructive',
              disabled: views.length === 1,
              onSelect: () => remove(target.id),
            },
          ]}
        />
      )}
    </div>
  )
}
