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
          'flex size-4 shrink-0 items-center justify-center rounded-[4px] border',
          'transition-[background-color,border-color,transform] duration-150 ease-out-strong',
          /* The box takes the press, the glyph pops in a touch small — the
             check reads as an action rather than a swap. */
          'peer-active:scale-[0.92]',
          'peer-focus-visible:ring-ring/50 peer-focus-visible:ring-[3px]',
          checked || indeterminate
            ? 'bg-accent-select border-accent-select text-white'
            /* 1.4px on #dedee1, per the frame — the default 1px on
               --color-input read a shade too heavy against the new rules. */
            : 'border-line-strong border-[1.4px] bg-card',
        )}
      >
        {indeterminate ? (
          <span className="motion-safe:animate-check-in h-[1.5px] w-2 rounded-full bg-current" />
        ) : checked ? (
          <CheckIcon className="motion-safe:animate-check-in size-3" />
        ) : null}
      </span>
    </label>
  )
}
