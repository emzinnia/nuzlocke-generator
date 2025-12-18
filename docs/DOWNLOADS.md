# Image Downloads — Cross‑Environment Strategy

We are seeing cross‑browser download failures caused by CORS/referrer handling differences. The goal is simple: image downloads must be consistent in every environment (local, preview, production). This document captures a strategy and options to get there.

## Requirements
- Works in all major browsers without special flags.
- Shields the client from CORS/credential/referrer quirks.
- Simple to operate in local dev and deployable with the repo.
- Minimizes origin leakage (no direct third‑party fetches from the browser when avoidable).

## Recommended Approach: Internal Fetch Proxy
Use an internal proxy owned by the repo to fetch images server‑side, then stream them back to the client. This keeps browsers from hitting third‑party hosts directly, avoiding CORS and mixed‑content issues.

Suggested behavior:
- Endpoint: e.g. `/api/image?url=ENCODED_URL`.
- Validate and whitelist allowed hosts or patterns.
- Fetch with server credentials if needed; strip auth before returning.
- Cache responses (etag/last-modified or short TTL) to reduce load.
- Return correct `Content-Type` and pass through `Content-Length` when present.
- Set `Cache-Control` appropriately for build targets (dev: no-store; prod: max-age with revalidate).
- Add basic abuse protection (size limit, timeout, deny-list).

Dev ergonomics:
- Include the proxy in the repo so local runs match deployed behavior.
- Provide `.env` toggles for upstream base URLs and optional API keys.

## Alternative Options (and trade-offs)
- **Third-party image CDN/proxy (e.g., imgix, Cloudflare Images/Workers):**
  - Pros: battle-tested caching and resizing; offloads bandwidth.
  - Cons: external dependency, potential cost, still need fallback for offline/local dev.
- **Signed URLs from backend:**
  - Pros: tighter control over source access.
  - Cons: still subject to browser CORS if fetched directly; better when paired with the proxy or CDN.
- **Direct browser fetch with relaxed CORS on origin:**
  - Pros: minimal infra.
  - Cons: brittle across hosts/browsers; fails when origins cannot be configured.

## Consistency Checklist
- Single code path for image retrieval in all environments (no “dev-only” bypasses).
- Proxy enforces size/time limits to avoid hangs.
- Clear error handling: surface a user-visible “image unavailable” state with a retry option.
- Logging for fetch failures to aid debugging (include target host, status, and timeout indicator).

## Action Items
1) Implement repo-owned proxy endpoint with host allowlist, size/time limits, and caching headers.  
2) Route all image downloads through the proxy by default; keep a feature flag to disable for troubleshooting.  
3) Add monitoring/logging around proxy fetch failures and response times.  
4) Document expected env vars (upstream base URL, optional API keys) and defaults for local dev.  
5) If needed, evaluate a CDN/Worker fronting the proxy for production while retaining the same interface.  