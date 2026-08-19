import { useEffect, useId, type ReactNode } from 'react'
import { CloseIcon } from '../modalIcons'

/**
 * The centred-dialog chrome the enrichment modals share — scrim, header band,
 * scrolling body, footer band. Same construction as CreateViewModal: Escape
 * closes, the body scroll locks (the page's own scroller is the scrollport
 * div, which stays live so trial results keep updating behind the panel).
 */
export function DialogShell({
  title, subtitle, onClose, children, footer,
}: {
  title: string
  subtitle?: string
  onClose: () => void
  children: ReactNode
  footer: ReactNode
}) {
  const titleId = useId()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="bg-os-gray-950/20 absolute inset-0 backdrop-blur-[2px] motion-safe:animate-menu-in"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="bg-card ring-foreground/10 fixed top-1/2 left-1/2 w-[520px] max-w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl ring-1 outline-none motion-safe:animate-dialog-in"
      >
        <div className="border-border-secondary flex items-start gap-3 border-b px-5 py-4">
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="text-base font-medium">{title}</h2>
            {subtitle && <p className="text-content-secondary mt-0.5 text-[12.5px]">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="hover:bg-overlay-secondary text-content-tertiary hover:text-foreground focus-visible:ring-ring/50 -mt-1 -mr-2 flex size-[30px] shrink-0 cursor-pointer items-center justify-center rounded-lg outline-none focus-visible:ring-[3px]"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-5">{children}</div>

        <div className="border-border-secondary bg-os-gray-50 flex items-center gap-2 border-t px-5 py-3">
          {footer}
        </div>
      </div>
    </div>
  )
}

/* Footer buttons, shared: dark primary as in the trial bar; bordered secondary. */
export const DIALOG_BTN =
  'flex h-[32px] shrink-0 cursor-pointer items-center rounded-lg px-3 text-[13px] font-medium ' +
  'whitespace-nowrap outline-none transition-[background-color,transform] duration-150 ' +
  'ease-out-strong active:scale-[0.97] focus-visible:ring-ring/50 focus-visible:ring-[3px]'

export const DIALOG_BTN_SECONDARY =
  `${DIALOG_BTN} border-line-strong shadow-raised border bg-white text-stone-800 hover:bg-stone-50`

export const DIALOG_BTN_PRIMARY =
  `${DIALOG_BTN} bg-os-gray-950 text-white hover:bg-os-gray-800 ` +
  'disabled:cursor-default disabled:opacity-50 disabled:hover:bg-os-gray-950'
