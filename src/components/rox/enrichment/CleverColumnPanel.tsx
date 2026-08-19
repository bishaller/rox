import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/cn'
import { type Anchor, useAnchoredOverlay } from '../overlay'

/**
 * The Clever Column quick setup, as in the live app: one prompt box, a
 * Generate-and-run button, and the manual escape hatch under an `or` rule.
 * Anchored where the "+" popover was, so picking Clever reads as the popover
 * turning into its setup rather than a new surface appearing elsewhere.
 */
export function CleverColumnPanel({
  anchor, prefill = '', onGenerate, onManualSetup, onClose,
}: {
  anchor: Anchor
  prefill?: string
  onGenerate: (prompt: string) => void
  onManualSetup: () => void
  onClose: () => void
}) {
  const { ref, pos } = useAnchoredOverlay({ anchor, onClose })
  const [prompt, setPrompt] = useState(prefill)
  const promptRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const el = promptRef.current
    if (!el) return
    el.focus()
    el.setSelectionRange(prefill.length, prefill.length)
  }, [prefill])

  return createPortal(
    <div
      ref={ref}
      role="dialog"
      aria-label="Clever Column quick setup"
      style={{ left: pos.x, top: pos.y, width: 372 }}
      className={cn(
        'border-border-tertiary bg-card shadow-card fixed z-50 rounded-xl border p-4',
        'origin-top-right motion-safe:animate-menu-pop motion-reduce:animate-menu-in',
      )}
    >
      <h2 className="text-content-primary text-[15px] font-medium">Clever Column quick setup</h2>
      <p className="text-content-secondary mt-1 flex items-center gap-1.5 text-[13px]">
        Type
        <kbd className="bg-os-gray-100 text-content-secondary rounded-[5px] px-1.5 py-px font-sans text-[11px] font-medium">
          @
        </kbd>
        to mention other columns
      </p>

      <textarea
        ref={promptRef}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Ex. What is this contact's current job title and how long have they been in the role?"
        className="border-line-strong focus-visible:border-ring mt-3 h-[120px] w-full resize-none rounded-[10px] border px-3 py-2.5 text-[13px] leading-relaxed outline-none"
      />

      <button
        type="button"
        disabled={prompt.trim().length === 0}
        onClick={() => onGenerate(prompt.trim())}
        className={cn(
          'border-line-strong shadow-raised mt-3 flex h-9 w-full cursor-pointer items-center',
          'justify-center gap-2 rounded-[10px] border bg-white text-[13.5px] font-medium text-stone-800',
          'transition-[background-color,transform] duration-150 ease-out-strong',
          'not-disabled:active:scale-[0.98] hover:bg-stone-50',
          'focus-visible:ring-ring/50 outline-none focus-visible:ring-[3px]',
          'disabled:cursor-default disabled:opacity-55 disabled:hover:bg-white',
        )}
      >
        Generate and run
        <span
          aria-hidden="true"
          className="flex size-4 items-center justify-center rounded-full bg-stone-400 text-[10px] font-semibold text-white"
        >
          i
        </span>
      </button>

      <div className="mt-3.5 flex items-center gap-3" aria-hidden="true">
        <span className="bg-line h-px flex-1" />
        <span className="text-content-tertiary text-[12px]">or</span>
        <span className="bg-line h-px flex-1" />
      </div>

      <button
        type="button"
        onClick={onManualSetup}
        className="hover:bg-os-gray-75 text-content-primary focus-visible:ring-ring/50 mt-2.5 w-full cursor-pointer rounded-lg py-1.5 text-center text-[13.5px] font-medium outline-none focus-visible:ring-[3px]"
      >
        Set up column manually
      </button>
    </div>,
    document.body,
  )
}
