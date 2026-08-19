import type { CSSProperties, ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { ROW_HEIGHTS, useTableConfig } from '@/dev/tableConfig'
import { EllipsisIcon, SortArrowIcon } from './icons'
import type { Anchor } from './overlay'

/**
 * The cell itself is NOT `display: flex` — that would pull it out of table
 * layout and break column alignment. The flex row lives on the inner wrapper.
 *
 * `relative` + the `after:` pseudo-element paint the row hover overlay; the
 * `group` is the `<tr>`.
 */
const CELL_BASE =
  /* Values sit at the primary text colour. They were secondary, which read
     as a table of disabled text next to the frame's near-black. */
  'group/cell text-ink relative px-3 py-1 align-middle ' +
  "[&_*]:whitespace-nowrap after:pointer-events-none after:absolute " +
  'after:inset-0 group-hover:after:bg-overlay-row-hover ' +
  /* background = the selection tint, after:background = the hover overlay. */
  'transition-colors duration-150 after:transition-colors after:duration-150'

/** Measured from the design frame: header 42, footer 36. */
export const HEADER_HEIGHT = 42
export const FOOTER_HEIGHT = 36

const FONT_SIZE = { 12: 'text-[12px]', 13: 'text-[13px]', 14: 'text-[14px]' } as const

/** Row and column rules are independent switches. */
function gridLineClasses(gridH: boolean, gridV: boolean) {
  return cn(
    (gridH || gridV) && 'border-line',
    gridH && 'border-b',
    gridV && 'border-r',
  )
}

export type StickySide = 'left' | 'right'
export type SortDirection = 'asc' | 'desc'

export type DataCellProps = {
  rowId: string
  colId: string
  children?: ReactNode
  className?: string
  style?: CSSProperties
  sticky?: StickySide
  stickyOffset?: string
  selected?: boolean
}

export function DataCell({
  rowId, colId, children, className, style, sticky, stickyOffset, selected,
}: DataCellProps) {
  const { config } = useTableConfig()
  const isSticky = sticky && config.stickyColumns

  return (
    <td
      data-row-id={rowId}
      data-col-id={colId}
      data-selected={selected || undefined}
      className={cn(
        CELL_BASE,
        gridLineClasses(config.gridH, config.gridV),
        FONT_SIZE[config.fontSize],
        isSticky && 'bg-card',
        // Variant utilities are emitted after base ones, so this wins over bg-card.
        'data-[selected]:bg-accent-select/5',
        className,
      )}
      style={{
        height: ROW_HEIGHTS[config.density],
        ...(isSticky ? { position: 'sticky', [sticky]: stickyOffset ?? '0px', zIndex: 20 } : null),
        ...style,
      }}
    >
      {/* The animation lives on this wrapper, never on the <td>: a transform
          on a sticky cell would re-parent it and break the pinned columns. */}
      <div className={cn(
        'flex h-full w-full min-w-0 items-center overflow-hidden',
        'motion-safe:animate-row-in [animation-delay:calc(var(--row-i,0)*14ms)]',
      )}>
        {children}
      </div>
    </td>
  )
}

export type HeaderCellProps = {
  colId: string
  children?: ReactNode
  className?: string
  sticky?: StickySide
  stickyOffset?: string
  /** Providing `onSort` turns the header into a sort control. */
  onSort?: () => void
  sortDirection?: SortDirection | null
  /**
   * Sits before the label, outside the sort button. The select-all checkbox
   * lives here — it cannot go inside `children`, which is the button's content,
   * because that would nest one control in another.
   */
  leading?: ReactNode
  /**
   * Wires the hover-revealed ellipsis into a real menu trigger. Without it
   * the button stays the decorative affordance it was.
   */
  onMenu?: (anchor: Anchor) => void
  menuLabel?: string
  /** Rendered right after the label — the TRIAL chip on an enrichment column. */
  badge?: ReactNode
}

export function HeaderCell({
  colId, children, className, sticky, stickyOffset, onSort, sortDirection, leading,
  onMenu, menuLabel, badge,
}: HeaderCellProps) {
  const menuButton = (
    <button
      type="button"
      aria-label={menuLabel ?? 'Column options'}
      aria-haspopup={onMenu ? 'menu' : undefined}
      onClick={onMenu ? (e) => {
        const r = e.currentTarget.getBoundingClientRect()
        onMenu({ x: r.left, y: r.bottom + 6 })
      } : undefined}
      className={cn(
        'text-stone-400 hover:bg-stone-100 hover:text-stone-800',
        'focus-visible:ring-ring/50 absolute right-0 flex size-5 shrink-0 cursor-pointer',
        'items-center justify-center rounded outline-none focus-visible:ring-[3px]',
        /* Inherits the header's own ground (hover tint included), so it masks
           the label end it overlaps rather than letting text show through. */
        'bg-inherit transition-opacity duration-150',
        'pointer-events-none opacity-0',
        'group-hover/header:pointer-events-auto group-hover/header:opacity-100',
        'focus-visible:pointer-events-auto focus-visible:opacity-100',
      )}
    >
      <EllipsisIcon className="size-3.5" />
    </button>
  )
  const { config } = useTableConfig()
  const isSticky = sticky && config.stickyColumns

  const ariaSort = !onSort
    ? undefined
    : sortDirection === 'asc' ? 'ascending'
      : sortDirection === 'desc' ? 'descending'
        : 'none'

  return (
    <th
      scope="col"
      data-col-id={colId}
      aria-sort={ariaSort}
      className={cn(
        // White ground, per the design — not the tinted datatable-header.
        'group/header bg-white text-ink hover:bg-stone-50',
        // gridLineClasses first: the header's own colour has to win the
        // twMerge, and it is stated after. The helper still contributes the
        // vertical rule when `gridV` is on.
        gridLineClasses(config.gridH, config.gridV),
        // The frame rules the header on both edges, in stone-200 rather than
        // the lighter --color-line the body cells carry.
        'border-stone-200 border-t border-b',
        FONT_SIZE[config.fontSize],
        'px-3 text-left font-medium whitespace-nowrap',
        className,
      )}
      style={{
        height: HEADER_HEIGHT,
        position: 'sticky',
        top: 0,
        ...(isSticky ? { [sticky]: stickyOffset ?? '0px', zIndex: 40 } : { zIndex: 30 }),
      }}
    >
      {onSort ? (
        /* bg-inherit chains the th's ground down to the menu button's mask —
           `inherit` reads the parent, and the span sits between them. */
        <span className="relative flex w-full items-center gap-2 bg-inherit">
          {leading}
          <button
            type="button"
            onClick={onSort}
            className="focus-visible:ring-ring/50 -mx-1 flex min-w-0 flex-1 cursor-pointer items-center gap-1.5 rounded px-1 outline-none focus-visible:ring-[3px]"
          >
            <span className="min-w-0 overflow-hidden text-clip">{children}</span>
            <SortArrowIcon
              className={cn(
                'shrink-0 transition-[opacity,transform] duration-200 ease-out',
                sortDirection ? 'opacity-100' : 'opacity-0',
                sortDirection === 'desc' && 'rotate-180',
              )}
            />
          </button>
          {badge}
          {/* Column options — revealed on header hover, as in the design. */}
          {menuButton}
        </span>
      ) : (
        <span className="relative flex w-full items-center gap-2 bg-inherit">
          {leading}
          {children}
          {badge}
          {onMenu && menuButton}
        </span>
      )}
    </th>
  )
}

/** Footer cell for the calculation row. Pinned to the bottom of the scroller. */
export function FooterCell({
  colId, children, className, sticky, stickyOffset,
}: {
  colId: string
  children?: ReactNode
  className?: string
  sticky?: StickySide
  stickyOffset?: string
}) {
  const { config } = useTableConfig()
  const isSticky = sticky && config.stickyColumns

  return (
    <td
      data-col-id={colId}
      className={cn(
        /* stone-200 is the em-dash colour the frame uses for the columns with
           nothing to total. `Stat` states its own two colours, so it is
           unaffected by the base being this light. */
        'border-line border-r bg-stone-100 text-stone-200',
        'px-3 whitespace-nowrap',
        FONT_SIZE[config.fontSize],
        className,
      )}
      style={{
        height: FOOTER_HEIGHT,
        position: 'sticky',
        bottom: 0,
        ...(isSticky ? { [sticky]: stickyOffset ?? '0px', zIndex: 40 } : { zIndex: 30 }),
      }}
    >
      {children}
    </td>
  )
}

/** The em-dash rendered in empty cells. */
export function EmptyValue() {
  return <span className="text-[14px] text-stone-200">—</span>
}

/** Plain single-line value. Crops at the cell edge — no ellipsis, per the frame. */
export function TextValue({ children }: { children: ReactNode }) {
  return <span className="overflow-hidden whitespace-nowrap text-clip">{children}</span>
}
