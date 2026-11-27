---
name: moldy-ui
description: Use when writing or styling components, layouts, forms, or pages in a Moldy Market frontend repo (Tailwind 4, shadcn, design tokens, i18n, states).
---

# UI rules

- Tokens only (defined in `src/index.css`): `bg-background text-foreground`, `bg-accent`/`bg-secondary` surface #f3f4f6, `text-muted-foreground` #777, `border-border`, `bg-primary text-primary-foreground`, `destructive`, plus `success`, `warning`, `info` (starting values, may change). No hex, no arbitrary colors. Radius via `rounded-md/lg/xl`.
- Look: minimal, monochrome, editorial (Mercari-like UX, not copied). Body Be Vietnam Pro; h1-h3 Playfair Display automatically. Desktop-first but must work at mobile width; use Tailwind default breakpoints.
- Compose with shadcn components; add missing ones with `npx shadcn@latest add <name>` (never hand-edit `src/components/ui`). Merge classes with `cn` from `@/lib/utils`.
- Every data view has 4 states: loading (skeleton), empty (message + next action), error (retry), forbidden/not-found where relevant. Put reusable ones in `src/components/feedback`.
- Forms: react-hook-form + `zodResolver`, schema in `features/<f>/schemas`. Show field errors from Zod and map Backend `code` errors to i18n keys. Disable submit while pending. Use `<label>` bound to inputs, `aria-invalid`, `aria-describedby` for errors.
- i18n: `useTranslation()`, no literal user-facing strings. vi first, en mirrored. Format money/date with `Intl` using the active language; Backend currency/date shapes come from doc 14 (do not assume).
- Accessibility: semantic elements, keyboard reachable, visible focus (ring token), alt text, icon-only buttons get `aria-label`.
- Components: one component per file, PascalCase file and name, props documented in JSDoc, no business logic or axios inside presentational components, no inline giant JSX (split at ~150 lines).
- Do not add dark mode, animations libraries, chart libraries, or new UI dependencies without asking the owner.
