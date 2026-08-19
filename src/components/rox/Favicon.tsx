import { useState } from 'react'
import { brandMark, faviconUrl } from '@/data/contacts'
import { cn } from '@/lib/cn'

/**
 * The company mark in the Domain column: the site's real favicon, fetched from
 * Google's favicon service off the row's domain.
 *
 * The drawn lettermark survives as the fallback — offline, or for a domain the
 * service has nothing for, the column still renders something branded rather
 * than a broken-image glyph. State per cell, so one dead favicon doesn't blank
 * the rest of the column.
 */
export function Favicon({ domain, className }: { domain: string; className?: string }) {
  const [failed, setFailed] = useState(false)
  const { label, className: ground } = brandMark(domain)

  if (failed) {
    return (
      <span
        aria-hidden="true"
        className={cn(
          'flex size-4 shrink-0 items-center justify-center rounded-[4px]',
          'leading-none font-semibold tracking-tight text-white',
          /* Two letters in a 19px box need the step down or they touch the
             edges — the frame sets `CB` at 8 and `P` at 10. */
          label.length > 1 ? 'text-[8px]' : 'text-[10px]',
          ground,
          className,
        )}
      >
        {label}
      </span>
    )
  }

  return (
    <span
      aria-hidden="true"
      className={cn(
        /* The ring keeps a white-on-white favicon from dissolving into the
           cell; overflow-hidden squares off any offered at odd sizes. */
        'flex size-4 shrink-0 items-center justify-center overflow-hidden',
        'rounded-[4px] ring-1 ring-stone-900/8',
        className,
      )}
    >
      <img
        src={faviconUrl(domain)}
        alt=""
        loading="lazy"
        className="size-full object-cover"
        onError={() => setFailed(true)}
      />
    </span>
  )
}
