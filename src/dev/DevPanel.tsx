import { useEffect, useState } from 'react'
import { cn } from '@/lib/cn'
import { type BooleanKey, PRESETS, useTableConfig } from './tableConfig'

/* ─────────────────────────────────────────────────────────
 * Dev control bar.
 *
 * Colours are hardcoded rather than drawn from the app's tokens — this is a
 * tool, not product UI, and it must stay legible whatever the table is doing.
 * Teal reads as "instrument"; Rox's own accents are blue and violet.
 * ───────────────────────────────────────────────────────── */

/* Palette, applied inline as arbitrary values so it can never drift into the
   app's token space:
     surface #ffffff · raised #f7f8f8 · line #e4e6e6
     ink     #16191a · muted  #8b9292
     on      #1f7a5f · on-soft #bff3dd · custom-badge #ffd6b8            */

function Switch({ label, value, onChange }: { label: string; value: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      onClick={onChange}
      className="group flex cursor-pointer items-center gap-1.5 rounded px-1 py-0.5 outline-none focus-visible:ring-2 focus-visible:ring-[#1f7a5f]/40"
    >
      <span
        aria-hidden="true"
        className={cn(
          'relative h-[14px] w-[24px] shrink-0 rounded-full transition-colors duration-150',
          value ? 'bg-[#1f7a5f]' : 'bg-[#d4d8d8] group-hover:bg-[#c2c7c7]',
        )}
      >
        <span
          className={cn(
            'absolute top-[2px] size-[10px] rounded-full bg-white shadow-sm transition-all duration-150',
            value ? 'left-[12px]' : 'left-[2px]',
          )}
        />
      </span>
      <span className={cn('text-[11px] whitespace-nowrap transition-colors',
        value ? 'text-[#16191a]' : 'text-[#8b9292]')}>
        {label}
      </span>
    </button>
  )
}

/** Exclusive scale — a row has one height, text has one size. */
function Scale<V extends string | number>({
  options, value, onChange,
}: {
  options: { value: V; label: string }[]
  value: V
  onChange: (v: V) => void
}) {
  return (
    <div className="flex overflow-hidden rounded-[5px] border border-[#e4e6e6]">
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            'cursor-pointer px-1.5 py-[3px] text-[11px] tabular-nums transition-colors',
            value === o.value
              ? 'bg-[#16191a] font-medium text-white'
              : 'bg-white text-[#8b9292] hover:bg-[#f7f8f8]',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

/** A numbered group, echoing the reference's "01 / 02" section rhythm. */
function Group({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <span className="flex items-baseline gap-1">
        <span className="text-[9px] font-medium tabular-nums text-[#1f7a5f]">{n}</span>
        <span className="text-[10px] font-medium tracking-[0.04em] text-[#8b9292]">
          {title}
        </span>
      </span>
      <div className="flex items-center gap-0.5">{children}</div>
    </div>
  )
}

function Divider() {
  return <div className="h-5 w-px shrink-0 bg-[#e4e6e6]" />
}

const GROUPS: { n: string; title: string; keys: { key: BooleanKey; label: string }[] }[] = [
  { n: '01', title: 'grid', keys: [
    { key: 'gridH', label: 'rows' },
    { key: 'gridV', label: 'cols' },
    { key: 'striped', label: 'stripes' },
  ] },
  { n: '02', title: 'columns', keys: [
    { key: 'showRowNumber', label: 'number' },
    { key: 'showCheckbox', label: 'checkbox' },
    { key: 'stickyColumns', label: 'sticky' },
  ] },
  { n: '03', title: 'cells', keys: [
    { key: 'enrichTag', label: 'chip' },
    { key: 'enrichGlyph', label: 'glyph' },
  ] },
  { n: '04', title: 'chrome', keys: [
    { key: 'showFooter', label: 'footer' },
    { key: 'boxed', label: 'boxed' },
  ] },
  { n: '05', title: 'motion', keys: [
    { key: 'motion', label: 'animate' },
  ] },
]

export function DevPanel() {
  const [open, setOpen] = useState(false)
  const { config, setConfig, toggle, applyPreset, activePreset, reset } = useTableConfig()

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((v) => !v)
      } else if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-3 left-3 z-[100] flex cursor-pointer items-center gap-2 rounded-[6px] border border-[#e4e6e6] bg-white/95 px-2.5 py-1.5 font-sans text-[10px] text-[#8b9292] shadow-sm backdrop-blur transition-colors hover:text-[#16191a]"
      >
        <span className="size-1.5 rounded-full bg-[#1f7a5f]" />
        variants
        <kbd className="rounded-[3px] border border-[#e4e6e6] bg-[#f7f8f8] px-1 text-[9px] text-[#8b9292]">⌘K</kbd>
      </button>
    )
  }

  return (
    <div className="z-[100] shrink-0 border-b border-[#e4e6e6] bg-white font-sans">
      {/* Row 1 — identity and presets */}
      <div className="flex items-center gap-3 px-4 pt-2.5 pb-2">
        <span className="flex shrink-0 items-center gap-2">
          <span className="size-1.5 rounded-full bg-[#1f7a5f]" />
          <span className="text-[11px] font-medium tracking-[0.02em] text-[#16191a]">
            Table variants
          </span>
        </span>

        {/* Presets are starting points — every switch below layers on top. */}
        <span className="shrink-0 text-[10px] text-[#a8adad]">start from</span>

        <div className="flex flex-wrap items-center gap-1">
          {Object.entries(PRESETS).map(([id, preset]) => {
            const active = activePreset === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => applyPreset(id)}
                className={cn(
                  'cursor-pointer rounded-[5px] border px-2 py-[3px] text-[11px] transition-colors',
                  active
                    ? 'border-[#1f7a5f] bg-[#bff3dd] font-medium text-[#0f5741]'
                    : 'border-[#e4e6e6] bg-white text-[#6b7272] hover:bg-[#f7f8f8] hover:text-[#16191a]',
                )}
              >
                {preset.label}
              </button>
            )
          })}
          {!activePreset && (
            <span className="ml-1 rounded-[4px] bg-[#ffd6b8] px-1.5 py-[3px] text-[10px] text-[#8a4a1c]">
              modified
            </span>
          )}
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          <button type="button" onClick={reset}
            className="cursor-pointer rounded-[5px] px-2 py-[3px] text-[11px] text-[#8b9292] transition-colors hover:bg-[#f7f8f8] hover:text-[#16191a]">
            reset
          </button>
          <button type="button" onClick={() => setOpen(false)}
            className="flex cursor-pointer items-center gap-1 rounded-[5px] border border-[#e4e6e6] px-2 py-[3px] text-[11px] text-[#8b9292] transition-colors hover:text-[#16191a]">
            close
            <kbd className="rounded-[3px] bg-[#f7f8f8] px-1 text-[9px]">esc</kbd>
          </button>
        </div>
      </div>

      {/* Row 2 — grouped switches */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-[#eef0f0] bg-[#fcfcfc] px-4 py-2">
        {GROUPS.map((g, i) => (
          <div key={g.n} className="flex items-center gap-3">
            {i > 0 && <Divider />}
            <Group n={g.n} title={g.title}>
              {g.keys.map((k) => (
                <Switch key={k.key} label={k.label} value={config[k.key]}
                  onChange={() => toggle(k.key)} />
              ))}
            </Group>
          </div>
        ))}

        <Divider />

        <Group n="06" title="scale">
          <div className="flex items-center gap-2">
            <Scale value={config.density} onChange={(v) => setConfig('density', v)}
              options={[
                { value: 'compact', label: '32' },
                { value: 'default', label: '48' },
                { value: 'comfortable', label: '56' },
              ]} />
            <Scale value={config.fontSize} onChange={(v) => setConfig('fontSize', v)}
              options={[
                { value: 12, label: '12' },
                { value: 13, label: '13' },
                { value: 14, label: '14' },
              ]} />
          </div>
        </Group>
      </div>
    </div>
  )
}
