# Performance Checklist

Use this checklist to track performance improvements across the stack. Items are intentionally concise; check them off as they are verified or implemented.

## Frontend (React UI)
- [ ] Audit top slow renders with React Profiler; memoize or split components with high render counts.
- [ ] Prefer derived props and selectors over passing large objects to avoid needless renders.
- [ ] Ensure list heavy views use `React.memo`, stable keys, and windowing (e.g., `react-window`) when large.
- [ ] Debounce/throttle expensive handlers (scroll, resize, search) to limit synchronous work.
- [ ] Move non-visual work (parsing, sorting, diffing) off the main thread via Web Workers when heavy.
- [ ] Minimize synchronous setState chains; batch updates and leverage `useTransition` for low-priority work.
- [ ] Defer non-critical effects to idle callbacks or `requestAnimationFrame` where applicable.
- [ ] Guard feature flags to avoid rendering hidden components or fetching unused data.
- [ ] Use suspense-friendly data fetching (where supported) to coordinate loading states efficiently.
- [ ] Keep component trees flat; avoid prop drilling with context selectors to limit renders.
- [ ] Prefetch/presend data for likely navigation paths; warm queries from cache where safe.
- [ ] Optimize images: responsive sizes, modern formats (AVIF/WebP), lazy loading, and correct `width/height`.
- [ ] Use `loading="lazy"` on offscreen media and `decoding="async"` on images where appropriate.
- [ ] Validate critical fonts: subset, preload key faces, use `font-display: swap` (or optional) to avoid jank.
- [ ] Reduce bundle bloat: tree-shake imports, remove unused polyfills, drop moment-like heavy deps.
- [ ] Apply route-level code splitting; lazy-load infrequently used editors/visualizers.
- [ ] Ensure shared chunks are sized appropriately; avoid accidental vendor duplication.
- [ ] Compress and cache static assets aggressively; verify far-future cache headers with content hashing.
- [ ] Verify HTTP/2 or HTTP/3 is used for asset delivery; limit parallel connections when on HTTP/1.1.
- [ ] Eliminate layout shift: stabilize dimensions, avoid late-loading banners/modals without reserved space.
- [ ] Measure Core Web Vitals (LCP, FID/INP, CLS, TTFB) in production and set budgets/alerts.
- [ ] Validate hydration boundaries and avoid blocking scripts/styles in the critical path.
- [ ] Avoid oversized JSON responses; paginate and stream where applicable.
- [ ] Prefer SVG or CSS effects over large raster assets when possible.
- [ ] Profile CSS: limit complex selectors and heavy box-shadows/filters on large lists.

## Backend & API
- [ ] Profile p95/p99 latency per endpoint; set SLOs and alert thresholds.
- [ ] Cache hot GETs at the edge or API gateway with proper validation (ETag/Last-Modified) and TTLs.
- [ ] Add application-level caching for expensive computations with eviction and stampede protection.
- [ ] Use pagination/limits and keyset pagination for large datasets; avoid OFFSET for deep pages.
- [ ] Reduce N+1 queries; add joins or batch loaders; ensure necessary indexes exist.
- [ ] Validate query plans regularly; watch for seq scans and missing composite indexes.
- [ ] Keep payloads lean: omit unused fields, compress responses (gzip/br), and support conditional requests.
- [ ] Prefer async/background processing for slow tasks; make APIs return quickly with job IDs when needed.
- [ ] Reuse connections (HTTP keep-alive, DB pools); ensure pool sizing matches workload.
- [ ] Validate timeouts, retries with jitter, and circuit breakers between services.
- [ ] Avoid synchronous fan-out; consolidate downstream calls or parallelize carefully.
- [ ] Add request coalescing for identical concurrent fetches to hot resources.
- [ ] Ensure idempotency for retried requests to prevent duplicate work.
- [ ] Monitor error rates and slow logs; capture traces for the slowest spans.

## Database & Storage
- [ ] Index high-cardinality filters and join keys; prune unused/overlapping indexes.
- [ ] Archive or partition large tables; keep hot data in smaller partitions.
- [ ] Use read replicas for read-heavy workloads; confirm read/write routing correctness.
- [ ] Optimize heavy aggregations with materialized views or precomputed counters.
- [ ] Keep transactions short; avoid long-held locks; tune isolation level per use case.
- [ ] Verify VACUUM/ANALYZE (or equivalent) cadence; watch for bloat.
- [ ] Limit large blobs in primary tables; move to object storage with signed URLs.

## Build & Tooling
- [ ] Enforce bundle size budgets in CI; fail builds on regressions.
- [ ] Enable minification, tree shaking, and dead-code elimination; verify ESM where possible.
- [ ] Use modern output targets (ES2017+) where supported; prune legacy transpilation.
- [ ] Split vendor/runtime chunks sensibly; avoid multiple versions of the same library.
- [ ] Add prefetch/preload hints generation for critical routes during build.
- [ ] Run `source-map-explorer` (or equivalent) periodically to catch bloat.
- [ ] Keep test fixtures lean; mock network and heavy deps in unit tests to speed CI.
- [ ] Cache package manager and build artifacts in CI; enable remote cache if available.
- [ ] Lint for performance footguns (e.g., accidental async void, large inline JSON, un-memoized props).

## Deployment & Runtime
- [ ] Serve static assets via CDN with cache-busting hashes and immutable caching.
- [ ] Enable TLS session resumption/HTTP keep-alive; tune compression settings (br/gzip) at the edge.
- [ ] Configure image/CDN resizing at the edge to deliver size-appropriate assets.
- [ ] Implement autoscaling policies based on CPU, memory, and latency; test scale-to-zero if relevant.
- [ ] Warm critical caches on deploy; avoid cold-start storms.
- [ ] Use health checks and slow-start/graceful shutdown to prevent connection drops during deploys.
- [ ] Monitor cost/performance ratios; right-size instances and DB tiers.

## Observability & Guardrails
- [ ] Track golden signals (latency, traffic, errors, saturation) with dashboards per service.
- [ ] Add high-cardinality tags sparingly; sample traces intelligently to capture tail latencies.
- [ ] Set alerts for Web Vitals and backend SLO breaches; include runbooks.
- [ ] Log payload sizes and query timings to catch regressions early.
- [ ] Run regular load tests and capture baselines before major releases.
- [ ] Document known performance budgets and ownership for each surface.

