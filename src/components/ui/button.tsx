import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * `default` — the bordered surface button (Add column, Add Contact, New list).
 * `link`    — the borderless underline-on-hover button used inside cells
 *             (company domain), per `shadow-none not-disabled:hover:underline gap-1`.
 * `ghost`   — icon-only affordances in the toolbar.
 */
export type ButtonVariant = 'default' | 'link' | 'ghost'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  iconStart?: ReactNode
  iconEnd?: ReactNode
}

/** Shared across every variant, lifted from the live DOM. */
const BASE =
  'font-sans focus-visible:border-ring focus-visible:ring-ring/50 ' +
  'aria-invalid:ring-destructive/20 aria-invalid:border-destructive ' +
  'bg-clip-padding focus-visible:ring-[3px] aria-invalid:ring-[3px] ' +
  'inline-flex items-center whitespace-nowrap transition-all ' +
  'disabled:cursor-not-allowed disabled:opacity-50 ' +
  '[&_svg]:pointer-events-none [&_svg]:shrink-0 outline-none ' +
  'group/button select-none cursor-pointer shrink-0 not-disabled:active:scale-[0.97]'

const VARIANTS: Record<ButtonVariant, string> = {
  default: cn(
    'h-[36px] gap-1.5 rounded-lg border px-2.5 justify-center',
    'has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
    'text-sm font-medium',
    'bg-button text-foreground border-button-border shadow-button',
    'not-disabled:hover:bg-button-hover not-disabled:hover:border-button-border-hover',
    'aria-expanded:bg-button-hover aria-expanded:border-button-border-hover',
    "[&_svg:not([class*='size-'])]:size-4",
  ),
  link: cn(
    'border border-transparent shadow-none not-disabled:hover:underline',
    'gap-1 rounded-md text-[13px] text-current',
  ),
  ghost: cn(
    'h-[30px] w-[30px] justify-center rounded-md border border-transparent',
    'text-content-secondary shadow-none not-disabled:hover:bg-overlay-primary',
    "[&_svg:not([class*='size-'])]:size-4",
  ),
}

export function Button({
  className, children, iconStart, iconEnd, variant = 'default', type = 'button', ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      data-slot="button"
      className={cn(BASE, VARIANTS[variant], className)}
      {...props}
    >
      {iconStart ? <span data-icon="inline-start" className="contents">{iconStart}</span> : null}
      {children}
      {iconEnd ? <span data-icon="inline-end" className="contents">{iconEnd}</span> : null}
    </button>
  )
}

export { PlusIcon } from '@/components/rox/icons'
