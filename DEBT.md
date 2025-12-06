# Tech Debt

Future target: real-time, collaborative Nuzlocking with rich customization and sharing on React + Phoenix.

## Current Debt
- Legacy Redux/persist store with ad-hoc migrations and state mixing UI + domain concerns; relies on version string casting and `any` fields (`src/store/index.ts`, `src/state/index.ts`).
- Dependency stack drift: React 19 + Vite alongside legacy packages (react-router v7 with v4 typings, redux-saga/thunk/logger, react-hot-loader, tslint, babel loaders) and unused auth/front-end libs in `package.json`.
- Real-time path unfinished: channel hook and patch sender exist but are not wired into state lifecycle; no presence/locking, optimistic conflict guardrails, or offline recovery; tokens sit in localStorage with no refresh/expiry handling (`src/api/useRunChannel.ts`, `src/api/patchSender.ts`, `src/api/client.ts`).
- Oversized, tightly coupled editors (e.g., `StyleEditor.tsx` ~1k lines, `ThemeEditor.tsx` ~550 lines) hinder reuse, testing, and feature work.
- Domain modeling gaps: weak typing for theme and run payloads, heavy `Partial<State>` usage across APIs, limited validation/serialization guarantees between frontend and Phoenix (`docs/BACKEND.md` expects stable JSONB).
- Sparse automated coverage: minimal unit tests, no contract tests for channel/patch flow, and no end-to-end coverage for collaborative editing.
- Asset and bundle bloat: large static asset set (thousands of icons/images) without clear loading strategy or code-splitting guardrails.

## Plan
1) **Dependency + tooling audit**: remove unused legacy packages, align router/types with React 19, drop Babel-era loaders/tslint, and standardize on Vite + TypeScript + Tailwind + SWC/esbuild. Lock Phoenix client deps to channel/auth needs only.
2) **Domain model + schema**: define canonical run schema (types + zod) under `src/lib` that mirrors the Phoenix JSONB shape; introduce migration utilities for persisted/local data and server payloads.
3) **State architecture reset**: introduce feature-scoped Zustand stores/selectors for run, editor, and settings; phase out Redux reducers/persist with an adapter layer to read legacy state and write the new shape.
4) **Real-time data layer**: centralize channel/session orchestration (join, presence, conflict resolution, optimistic patch queue, retry/backoff) and integrate patchSender with the store; add offline/flush semantics and deterministic revision handling to match RunStore.
5) **Auth/session hardening**: move tokens to rotating/refreshable flow (httpOnly where possible), add reauth and logout propagation, and gate channel joins + REST calls on verified session state.
6) **Editor decomposition**: break Style/Theme editors into small composable panels with shared UI primitives; extract pure transformers to `/lib` and keep components presentational to prepare for multi-user editing and per-field locks.
7) **Validation + serialization**: enforce decode/encode boundaries for all API/channel traffic, reject invalid patches client-side, and keep backend schema docs in sync. Add migration tests to prevent data loss.
8) **Testing + quality bar**: add vitest coverage for store selectors, patch queue, channel handshake, and migrations; add Cypress flows for collaborative editing, undo/redo, and share/export; wire lint/test to CI.
9) **Performance + assets**: implement code-splitting for heavy editors, lazy-load large asset groups, and consider CDN/hashed delivery for icons and screenshots to shrink bundles.

