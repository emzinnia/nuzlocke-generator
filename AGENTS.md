# Nuzlocke Generator

A React + Redux web app for tracking Pokémon Nuzlocke challenge runs. All user data is stored client-side (localStorage + IndexedDB). No database required.

## Cursor Cloud specific instructions

### Node version

This project requires **Node.js ^24** and **npm >=11**. The environment uses nvm with Node 24 set as the default alias.

### Key commands

| Task | Command |
|------|---------|
| Install deps | `npm install` |
| Dev server | `npm run dev` (Vite on `localhost:8080`) |
| Lint | `npm run lint` |
| Unit tests | `npm run test:run` (vitest) |
| Type check | `npm run typecheck` |
| Build | `npm run build` |
| E2E tests | `npx playwright install --with-deps chromium && npm run test:e2e` |

### Dev server notes

- `npm run dev` starts Vite with HMR on port 8080.
- The Express server (`npm run serve:node`) is only needed for the `/report` and `/release` API endpoints (GitHub bug reporter + release notes). The Vite dev server is sufficient for frontend development.
- No `.env` file is required for core functionality; optional env vars (`GH_ACCESS_TOKEN`, `VITE_CORS_ANYWHERE_URL`) enable bug reporting and sprites mode.

### Testing notes

- Unit tests use vitest with jsdom environment. Run `npm run test:run` for a single pass.
- E2E tests require Playwright with Chromium. Install browsers first: `npx playwright install --with-deps chromium`.
- Lint exits 0 with warnings only (no errors) on a clean checkout.
