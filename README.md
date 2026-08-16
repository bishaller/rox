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
  index.css              Tailwind v4 @theme — mirrors the Figma "Rox Tokens" collection
  lib/cn.ts              clsx + tailwind-merge helper
  components/ui/
    button.tsx           Base button + PlusIcon
    pill.tsx             Pill (accent-select / neutral tones)
  App.tsx                Component smoke test
```

## Design source

- Figma: https://www.figma.com/design/HrUckDbbVh3llrCJypEr6n
- Paper: https://app.paper.design/file/01M00ZDW3V02X1DF7DQB6BS2XZ

Token names in `@theme` match the Figma variable collection, so a change in one
should be mirrored in the other.

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

- The `Geist` font is referenced but not bundled. Add `@fontsource-variable/geist`
  (or a `<link>` to Google Fonts) before the type will match the design exactly.
- Token values are sampled from the app screenshot, not from the Rox codebase.
  If the real theme values become available, update `@theme` in `src/index.css`.
