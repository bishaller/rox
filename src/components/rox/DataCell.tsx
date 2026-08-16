import type { CSSProperties, ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { ROW_HEIGHTS, useTableConfig } from '@/dev/tableConfig'
import { EllipsisIcon, SortArrowIcon } from './icons'

/**
 * The cell itself is NOT `display: flex` — that would pull it out of table
 * layout and break column alignment. The flex row lives on the inner wrapper.
 *
 * `relative` + the `after:` pseudo-element paint the row hover overlay; the
 * `group` is the `<tr>`.
 */
const CELL_BASE =
  'group/cell text-content-secondary relative px-3 py-1 align-middle ' +
  "[&_*]:whitespace-nowrap after:pointer-events-none after:absolute " +
  'after:inset-0 group-hover:after:bg-overlay-secondary ' +
  /* background = the selection tint, after:background = the hover overlay. */
  'transition-colors duration-150 after:transition-colors after:duration-150'

export const HEADER_HEIGHT = 40

const FONT_SIZE = { 12: 'text-[12px]', 13: 'text-[13px]', 14: 'text-[14px]' } as const

/** Row and column rules are independent switches. */
function gridLineClasses(gridH: boolean, gridV: boolean) {
  return cn(
    (gridH || gridV) && 'border-border-tertiary',
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
}

export function HeaderCell({
  colId, children, className, sticky, stickyOffset, onSort, sortDirection,
}: HeaderCellProps) {
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
        'bg-card hover:bg-os-gray-50 text-content-primary group/header',
        // Colour is stated explicitly: the grid-line helper may contribute no
        // border colour when both rule switches are off, and Tailwind would
        // then fall back to currentColor.
        'border-border-tertiary border-t',
        gridLineClasses(config.gridH, config.gridV),
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
        <span className="relative flex w-full items-center gap-1">
          <button
            type="button"
            onClick={onSort}
            className="focus-visible:ring-ring/50 -mx-1 flex min-w-0 flex-1 cursor-pointer items-center gap-1.5 rounded px-1 outline-none focus-visible:ring-[3px]"
          >
            <span className="min-w-0 truncate">{children}</span>
            <SortArrowIcon
              className={cn(
                'shrink-0 transition-[opacity,transform] duration-200 ease-out',
                sortDirection ? 'opacity-100' : 'opacity-0',
                sortDirection === 'desc' && 'rotate-180',
              )}
            />
          </button>
          {/* Column options — revealed on header hover, as in the design. */}
          <button
            type="button"
            aria-label={`Column options`}
            className={cn(
              'text-content-tertiary hover:bg-os-gray-100 hover:text-content-primary',
              'focus-visible:ring-ring/50 absolute right-0 flex size-5 shrink-0 cursor-pointer',
              'items-center justify-center rounded outline-none focus-visible:ring-[3px]',
              /* Matches the header's own hover ground, so it masks the label
                 end it overlaps rather than letting text show through. */
              'bg-os-gray-50 transition-opacity duration-150',
              'pointer-events-none opacity-0',
              'group-hover/header:pointer-events-auto group-hover/header:opacity-100',
              'focus-visible:pointer-events-auto focus-visible:opacity-100',
            )}
          >
            <EllipsisIcon className="size-3.5" />
          </button>
        </span>
      ) : (
        children
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
        'bg-datatable-header text-content-tertiary border-t border-r border-border-tertiary',
        'px-3 whitespace-nowrap',
        FONT_SIZE[config.fontSize],
        className,
      )}
      style={{
        height: HEADER_HEIGHT,
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
  return <span className="text-content-tertiary text-xs">—</span>
}

/** Plain truncating text value, as used by the email / company columns. */
export function TextValue({ children }: { children: ReactNode }) {
  return <span className="line-clamp-2 truncate whitespace-pre-wrap">{children}</span>
}
