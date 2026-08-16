import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

/* Rebuilt from the design as real markup. It was two PNG screenshots, which
   froze the active-nav treatment and cost us hover states and theming. */

function NavItem({
  icon, label, active, onClick,
}: {
  icon: ReactNode
  label: string
  active?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex h-[38px] w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5',
        'text-[15px] transition-colors outline-none',
        'focus-visible:ring-ring/50 focus-visible:ring-[3px]',
        active
          ? 'bg-os-gray-700 font-medium text-white'
          : 'text-content-secondary hover:bg-os-gray-100',
      )}
    >
      <span className="flex size-[18px] shrink-0 items-center justify-center">{icon}</span>
      <span className="truncate">{label}</span>
    </button>
  )
}

/** Stroke icon at the sidebar's 18px slot size. */
function I({ d, extra }: { d: string; extra?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="size-[18px]" aria-hidden="true">
      <path d={d} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {extra && <path d={extra} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />}
    </svg>
  )
}

const ICONS = {
  home: <I d="M3.2 8 10 2.8 16.8 8v8a1.3 1.3 0 0 1-1.3 1.3H4.5A1.3 1.3 0 0 1 3.2 16z" />,
  chat: <I d="M17 9.5a6.4 5.8 0 0 1-6.4 5.8 7.8 7.8 0 0 1-2.9-.6l-3.7 1.2 1.1-3a5.6 5.6 0 0 1-1.1-3.4 6.4 5.8 0 0 1 6.6-5.8A6.4 5.8 0 0 1 17 9.5z" />,
  agents: <I d="M10 3a2.6 2.6 0 1 1 0 5.2A2.6 2.6 0 0 1 10 3" extra="M6.4 16.4a3.6 3.6 0 0 1 7.2 0M10 8.2v3.4M6.4 12.8a1.8 1.8 0 1 1 0 3.6 1.8 1.8 0 0 1 0-3.6M13.6 12.8a1.8 1.8 0 1 1 0 3.6 1.8 1.8 0 0 1 0-3.6" />,
  accounts: <I d="M2.8 6.6h14.4v9.8H2.8z" extra="M7.4 6.6V5.2a1.2 1.2 0 0 1 1.2-1.2h2.8a1.2 1.2 0 0 1 1.2 1.2v1.4" />,
  people: <I d="M7.9 3.9a3 3 0 1 1 0 6 3 3 0 0 1 0-6" extra="M2.8 16.4a5.2 4.2 0 0 1 10.2 0M13.6 4.9a2.9 2.9 0 0 1 0 5.1M14.9 12a4.8 3.8 0 0 1 2.7 3.8" />,
  sequences: <I d="M17.2 3 2.6 8.4l6 2.6 2.6 6z" extra="M8.6 11 17.2 3" />,
  meetings: <I d="M2.8 4.6h14.4v12.8H2.8z" extra="M2.8 8.4h14.4M6.6 3v3M13.4 3v3" />,
  opportunities: <I d="M2.8 3.4h14.4v13.2H2.8z" extra="M7 7v6M10 7v6M13 7v6" />,
  apps: <I d="M2.8 3.4h14.4v13.2H2.8z" extra="M6.4 13.4V9.2M10 13.4V6.6M13.6 13.4v-2.6" />,
}

export type SidebarProps = {
  /** Label of the nav entry to mark current. */
  active?: string
  onNavigate?: (page: string) => void
}

export function Sidebar({ active = 'People', onNavigate }: SidebarProps) {
  const item = (label: string, icon: ReactNode) => (
    <NavItem icon={icon} label={label} active={active === label}
      onClick={onNavigate ? () => onNavigate(label) : undefined} />
  )

  return (
    <aside className="bg-app-bg flex w-[212px] shrink-0 flex-col" aria-label="Primary">
      {/* Brand */}
      <div className="flex h-[52px] shrink-0 items-center justify-between px-3">
        <div className="flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 26 26" fill="none" aria-hidden="true">
            <circle cx="13" cy="13" r="11.5" className="stroke-content-quaternary" strokeWidth="1.6" />
            <circle cx="13" cy="13" r="4" className="fill-content-quaternary" />
            <path d="M13 1.5v7M13 17.5v7" className="stroke-content-quaternary" strokeWidth="1.6" />
          </svg>
          <span className="text-content-quaternary text-[16px] font-semibold tracking-[0.08em]">
            ROX
          </span>
        </div>
        <button type="button" aria-label="Collapse sidebar"
          className="text-content-tertiary hover:bg-os-gray-100 flex size-7 cursor-pointer items-center justify-center rounded-md">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <rect x="2.5" y="3.5" width="15" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M7.5 3.5v13" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </button>
      </div>

      <nav className="flex flex-col gap-0.5 px-2.5">
        {item('Home', ICONS.home)}
        {item('Chat', ICONS.chat)}
        {item('Agents', ICONS.agents)}
      </nav>

      <div className="bg-border mx-3.5 my-3 h-px shrink-0" />

      <nav className="flex flex-col gap-0.5 px-2.5">
        {item('Accounts', ICONS.accounts)}
        {item('People', ICONS.people)}
        {item('Sequences', ICONS.sequences)}
        {item('Meetings', ICONS.meetings)}
        {item('Opportunities', ICONS.opportunities)}
        {item('Apps', ICONS.apps)}
      </nav>

      <div className="flex-1" />

      {/* Footer */}
      <div className="flex flex-col gap-1 px-2.5 pb-3">
        <button type="button"
          className="bg-os-gray-100 text-content-secondary hover:bg-os-gray-150 flex h-[38px] cursor-pointer items-center justify-between rounded-lg px-2.5 text-[14px]">
          <span className="flex items-center gap-2.5">
            <svg width="18" height="18" viewBox="0 0 19 19" fill="none" aria-hidden="true">
              <circle cx="9.5" cy="9.5" r="7.4" className="stroke-accent-select" strokeWidth="1.6"
                strokeDasharray="4 3.2" />
            </svg>
            Get Started
          </span>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M6 3.5 10.5 8 6 12.5" stroke="currentColor" strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <button type="button"
          className="text-content-secondary hover:bg-os-gray-100 flex h-[38px] cursor-pointer items-center gap-2.5 rounded-lg px-2.5 text-[14px]">
          <svg width="18" height="18" viewBox="0 0 19 19" fill="none" aria-hidden="true">
            <path d="M9.5 2.6v9.3M5.7 8.4l3.8 3.8 3.8-3.8M3.2 15.6h12.6" stroke="currentColor"
              strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Download app
        </button>

        <div className="mt-1 flex items-center gap-2.5 px-2.5 py-2">
          <span className="bg-user-avatar flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white">
            BI
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="text-content-primary truncate text-[14px]">bishal.mishra…</span>
            <span className="text-content-tertiary text-[12px]">Rox</span>
          </span>
        </div>
      </div>
    </aside>
  )
}
