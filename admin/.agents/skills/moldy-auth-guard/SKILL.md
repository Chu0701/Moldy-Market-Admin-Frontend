---
name: moldy-auth-guard
description: Use when implementing login, register, logout, token handling, 401/403 handling, session bootstrap, route guards, or role-based UI in a Moldy Market frontend repo.
---

# Auth and guards

> Current override (2026-11-22): read the approved HANDOFF-ADMIN-FRONTEND.md in the repository documentation first. Q2 is resolved: access token in the app-specific localStorage module; refresh token in a Backend-set HttpOnly cookie, withCredentials and X-Moldy-Auth header on auth requests. Never read/store a refresh token in JavaScript. Current session key is [users, me]. Email OTP activates accounts directly; admin must not bypass OTP. Staff resource permissions require the actual same-store membership, not merged role permissions. The older token/activation/session-key proposals below are historical and must not override these decisions.

Read `docs/08-AUTHENTICATION-AND-AUTHORIZATION.md` and doc 14 section 3 first (only those sections).

Verified Backend facts: access token 15 min, refresh token 30 days, refresh rotates; reusing an old refresh token (`AUTH_007`) makes Backend revoke ALL sessions of the user. JWT only carries sub/email/tokenType. `GET /api/v1/users/me` returns role names only (USER, APPRAISER, STAFF, ADMIN, OWNER); no endpoint returns permission codes (Q1). Authorization is per request on Backend. New registered users are PENDING_VERIFICATION and cannot log in (B10).

Implementation rules:

- Token storage is undecided (Q2). Put ALL read/write in `src/lib/tokenStorage.js` (get/set/clear access and refresh). Default proposal: access token in memory, refresh token in `localStorage`; ask the owner to confirm before shipping, and mention XSS trade-off. Do not scatter storage calls.
- 401 handling in the Axios response interceptor: refresh ONCE with a single shared in-flight promise, queue other failed requests, replay them after success; if refresh fails, clear tokens, reset Query cache, redirect to `/login` with return path. Never loop, never refresh on the refresh/login calls themselves, never send the old refresh token twice.
- Session bootstrap: on app load, if a refresh token exists, refresh then `GET /api/v1/users/me`; show a full-page loader until resolved. Keep the user object in TanStack Query (`['me']`), not Zustand. Zustand may hold only a tiny `isAuthenticated`-like UI flag if truly needed.
- Guards live in `src/app/router/`: `RequireAuth` (redirect to `/login?next=`), `RequireRole` (role names from `/users/me`; UX only), `RequireStoreAccess` (user's store from `GET /api/v1/stores/my-store`; staff detection is unresolved due to Q1, so treat 403 as truth and show a Forbidden state).
- Admin app: allow entry only if `/users/me` roles include `ADMIN`; otherwise sign out locally and show a message. Backend remains the real gate; B2 means some admin-ish endpoints on unmerged branches are not protected yet.
- 403: show a Forbidden state (`components/feedback`), do not retry. Logout: call the logout endpoint (doc 14), then clear tokens and Query cache regardless of result.
- Never log tokens, never put them in URLs, never display them.
