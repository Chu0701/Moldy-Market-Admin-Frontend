---
name: moldy-api-service
description: Use when creating or changing the Axios client, a service module, error handling, or pagination adapters in a Moldy Market frontend repo.
---

# API layer rules

- One Axios instance in `src/services/api/client.js`: `baseURL = import.meta.env.VITE_API_BASE_URL || ''`, JSON headers, request interceptor adds `Authorization: Bearer <access>` from the token module, response interceptor handles 401 (see `moldy-auth-guard`).
- `src/services/api/unwrap.js`: returns `response.data.data` when the envelope exists; returns `undefined` for no-body endpoints (DELETE category/product, notification PATCH/DELETE, etc.). Never assume `data.data` exists.
- `src/services/api/ApiError.js`: carries `status`, `code` (e.g. `AUTH_007`, `COMMON_010`), `message`, original response. Components map `code` to i18n keys; never show raw Backend messages blindly.
- Each endpoint = one small async function in `src/services/<module>/`, full path as written in doc 14 (`/api/v1/...` or `/api/...`). Params as an object, JSDoc with the doc 14 DTO shape. No React, no hooks, no toasts, no navigation.
- Pagination has 5 shapes (doc 14 section 2.2): `PagedResponse` (1-based `page`), `ProductSearchResponse`, notification cursor `token`, chat Spring `Page` (0-based, default size 4), plain lists (orders, payments). Write a separate adapter per shape in `src/services/api/pagination.js` that normalizes to `{ items, page, totalPages, hasNext }`. Do this only for shapes of IMPLEMENTED endpoints now.
- Update product requires `version`; `409 COMMON_010` => refetch and tell the user data changed.
- Image fields accept https URLs only (Q5); no upload endpoint exists.
- Before writing a function: grep the exact path in `docs/14-BACKEND-INTEGRATION-MATRIX.md`. If absent or not IMPLEMENTED, do not write it.
- Env: never read `API_PROXY_TARGET` in app code (dev-server only).
