import { cn } from '@/lib/cn'
import { CheckIcon } from '@/components/rox/icons'

export type CheckboxProps = {
  checked: boolean
  /** Some-but-not-all selected. Renders a dash and sets `input.indeterminate`. */
  indeterminate?: boolean
  onChange: () => void
  /** Required — this control has no visible text label. */
  label: string
  className?: string
}

/**
 * A real `<input type="checkbox">` visually replaced by a styled box.
 * The input stays in the accessibility tree and keeps native keyboard
 * behaviour (Space to toggle, focus ring via `peer-focus-visible`).
 */
export function Checkbox({
  checked, indeterminate = false, onChange, label, className,
}: CheckboxProps) {
  return (
    <label className={cn('relative inline-flex cursor-pointer items-center justify-center', className)}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        aria-label={label}
        ref={(el) => {
          if (el) el.indeterminate = indeterminate
        }}
        className="peer absolute size-0 appearance-none opacity-0"
      />
      <span
        aria-hidden="true"
        className={cn(
          'flex size-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors',
          'peer-focus-visible:ring-ring/50 peer-focus-visible:ring-[3px]',
          checked || indeterminate
            ? 'bg-accent-select border-accent-select text-white'
            : 'border-input bg-card',
        )}
      >
        {indeterminate ? (
          <span className="h-[1.5px] w-2 rounded-full bg-current" />
        ) : checked ? (
          <CheckIcon className="size-3" />
        ) : null}
      </span>
    </label>
  )
}
