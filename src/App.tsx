import { useState } from 'react'
import { Agentation } from 'agentation'
import { PeopleContacts } from '@/pages/PeopleContacts'
import { Accounts } from '@/pages/Accounts'
import { TableConfigProvider } from '@/dev/tableConfig'
import { DevPanel } from '@/dev/DevPanel'

const DEV = import.meta.env.DEV

/** Only these two are built; every other nav entry is inert. */
const PAGES = ['People', 'Accounts']

export default function App() {
  const [page, setPage] = useState('People')

  const navigate = (next: string) => {
    if (PAGES.includes(next)) setPage(next)
  }

  return (
    <TableConfigProvider>
      {/* The dev bar sits above the app shell rather than over it, so it never
          covers product UI. Both are dev-only. */}
      <div className="flex h-dvh flex-col">
        {DEV && <DevPanel />}
        <div className="min-h-0 flex-1">
          {page === 'Accounts'
            ? <Accounts onNavigate={navigate} />
            : <PeopleContacts onNavigate={navigate} />}
        </div>
      </div>
      {DEV && <Agentation />}
    </TableConfigProvider>
  )
}
