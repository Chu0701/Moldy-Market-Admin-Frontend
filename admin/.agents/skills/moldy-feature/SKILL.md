---
name: moldy-feature
description: Use when implementing a page or feature end to end in a Moldy Market frontend repo (service, hook, schema, component, page, route, i18n, test).
---

# Implement one feature

Order (stop after each layer compiles; do not write everything in one go):

1. **Service** (`src/services/<module>/<module>Service.js`): see `moldy-api-service`.
2. **Schema** (`src/features/<f>/schemas/*.js`): Zod. Limits must come from doc 14 (e.g. password 8-100, product title <= 150). If a limit is unknown write `// TODO(doc14)` and keep validation minimal.
3. **Hooks** (`src/features/<f>/hooks/`): TanStack Query.
   - Query key factory per module: `['products', 'list', params]`, `['products', 'detail', id]`.
   - Mutations invalidate the narrowest key. No data copied into Zustand.
   - Hooks return query/mutation objects; no JSX.
4. **Components** (`features/<f>/components/`): presentational where possible, props typed with JSDoc. Handle loading (skeleton), empty, error, forbidden states explicitly. See `moldy-ui`.
5. **Page** (`features/<f>/pages/XxxPage.jsx`): composes hooks and components, default export not required but one page per file, name ends with `Page`.
6. **Route**: register in `src/app/router/` under the right layout and guard (`moldy-auth-guard`). Use lazy loading for pages.
7. **i18n**: add vi keys then en mirror in `src/i18n/locales/<lang>/common.json` (or a feature namespace if it grows). camelCase, grouped.
8. **Test** (if Vitest is configured): at least schema tests and one component/hook test for the happy path and the error path. Mock at the service boundary only.
9. **Docs**: if you changed a contract assumption, update doc 14 or the relevant doc in the SAME change. Flip Frontend status NOT_STARTED -> INTEGRATED in doc 14 only when the feature works against the real Backend.
10. Run `npm run format && npm run lint && npm run build && npm run test`.

Anti-patterns: calling axios inside components; putting API data in Zustand; `useEffect` for data fetching; hard-coded strings; editing `components/ui`; guessing error codes (read doc 14 section on error codes); duplicating a route table in another doc.
