# Rox — People / My Contacts

Vite + React + TypeScript + Tailwind v4 rebuild of the Rox contacts screen.

## Prerequisites

Node.js 20.19+ or 22.12+ (required by Vite 6). Not currently installed on this
machine — install from [nodejs.org](https://nodejs.org) or via Homebrew.

## Getting started

```bash
npm install
npm run dev
```

## Structure

```
src/
  index.css                    Tailwind v4 @theme — the Rox token collection
  lib/cn.ts                    clsx + tailwind-merge helper
  App.tsx                      Page switch (People / Accounts), dev-only chrome
  pages/
    PeopleContacts.tsx         People / My Contacts — the design frame below
    Accounts.tsx               Accounts (self-contained; shares tokens only)
  components/rox/              Sidebar, TopBar, Toolbar, ViewTabs, DataTable,
                               DataCell, Favicon, AddColumnModal, icons
  components/ui/               Button, Checkbox, Pill, Tag
  data/                        contacts.ts (54 synthetic rows), accounts.ts
  dev/                         ⌘K variant panel + its config context
```

## Design source

- Figma: https://www.figma.com/design/HiqD1YGT6aQOOG10lSbE9X/Rox?node-id=3698-25499
- Paper: https://app.paper.design/file/01M00ZDW3V02X1DF7DQB6BS2XZ

Token names in `@theme` match the Figma variable collection, so a change in one
should be mirrored in the other. The `brand/*`, `indigo/*` and `violet/*` values
are read from that collection; the warm `os-gray` ramp is still sampled from a
screenshot of the running app.

The ⌘K dev panel opens on the `figma` preset, which reproduces the frame above.
The other presets are explorations around it.

## Annotating the UI

[Agentation](https://www.agentation.com/) is wired in as a dev dependency and
rendered only when `import.meta.env.DEV` is true (see `src/App.tsx`).

With `npm run dev` running, click the icon in the bottom-right corner, then click
any element to leave feedback. Copy the markdown output and paste it into the
agent — it carries the CSS selector, source file path, React component hierarchy
and computed styles, so feedback lands on the exact element.

Agentation also ships an MCP integration that lets the agent query annotations
directly ("what annotations do I have?", "fix annotation 3") without copy-paste.
Setup for that is not covered here — see the Agentation site.

## Notes

- Contact names, emails and LinkedIn handles in `src/data/contacts.ts` are
  invented. The design frame shows real CRM records; they are deliberately not
  reproduced here (see `.gitignore`).
- The page is a rebuild, not an app: search, sort, selection, the enrichment
  Run / Run All buttons and the Add-column dialog work; everything else
  (Filter, Sort, In CRM, the view tabs, the breadcrumb menu) is inert by design.
- Enrichment is mocked in `DataTable.tsx` — `categorize()` derives a category
  from the row id so a re-run never reshuffles the column.
