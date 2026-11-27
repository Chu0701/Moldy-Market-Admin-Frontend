# Moldy Market — Admin Frontend (`Moldy-Market-Admin-Frontend`)

Ứng dụng web quản trị độc lập dành cho **Quản trị viên (`ADMIN`)** của nền tảng **Moldy Market**.

## Tech Stack

- **Runtime & Build:** Node 22 (`.nvmrc`), Vite 8, React 19, JavaScript (ESM + JSDoc, no TypeScript)
- **Routing & State:** React Router v7 (`createBrowserRouter` + native `lazy` routes), TanStack Query v5, Zustand v5 (`sidebarStore` UI state only)
- **Forms & Validation:** `react-hook-form` + Zod v4 + `@hookform/resolvers`
- **Styling & UI:** Tailwind CSS v4 (`@layer components` semantic classes & design tokens in `src/index.css`), shadcn/ui (`radix-nova`), `lucide-react`
- **i18n:** `i18next` (`vi` default, `en` mirrored, namespace `common`)
- **Testing & Quality:** Vitest + React Testing Library (`6` test files, `13` passing tests), ESLint 10, Prettier

## Scripts

```bash
npm install
npm run dev           # Vite dev server (proxies /api -> http://localhost:8080)
npm run format        # Prettier write
npm run format:check  # Prettier verify
npm run lint          # ESLint
npm run test          # Vitest
npm run build         # Production Vite build
```

## Implemented Scope (2026-11-27, `b285031`)

- **App Shell & Infra:** `AppProviders`, `queryClient`, `AdminLayout` + `AdminSidebar` + `AdminHeader`, `src/lib/tokenStorage.js` (`moldy-market:admin:access-token`), `src/services/api/{ApiError,unwrap,client,apiErrorMessage}.js`, shared `common/` & `feedback/` components, `@layer components` CSS in `src/index.css`. _(Login/RequireAdmin guard is intentionally deferred per owner's request during local development.)_
- **Group 2 Modules (Implemented & Tested):**
  - **Disputes** (`/disputes`, `/disputes/:disputeId`): list, detail, evidence gallery, approve/reject review form.
  - **Withdrawals** (`/withdrawals`): queue, process/complete/reject action dialogs with validation.
  - **Platform Vouchers** (`/vouchers`): create platform voucher form + table.
- **Pending:** Admin Login / `RequireAdmin` guard + Group 1 MVP (`Users`, `Stores`, `Product Moderation`, `Categories`).

## Documentation & Agent Onboarding

- Agent rules & reading map: [`admin/AGENTS.md`](./admin/AGENTS.md) and `admin/.agents/skills/`
- Admin handoff brief: [`Moldy-Market-Admin-Frontend/docs/HANDOFF-ADMIN-FRONTEND.md`](./Moldy-Market-Admin-Frontend/docs/HANDOFF-ADMIN-FRONTEND.md)
- Routes & pages catalog: [`Moldy-Market-Admin-Frontend/docs/04-ROUTING-AND-PAGES.md`](./Moldy-Market-Admin-Frontend/docs/04-ROUTING-AND-PAGES.md)
- Master 3-repo Codex onboarding doc: `CODEX_HANDOFF.md` in Backend repository (`Moldy-Market`).
