# Static Asset Storage

The large Pokémon image and sprite folders can be served from separate object storage/CDN instead of being copied into every app build.

## Runtime URL

Set `VITE_STATIC_ASSETS_BASE_URL` to the public origin that mirrors the app's generated asset paths:

```sh
VITE_STATIC_ASSETS_BASE_URL=https://cdn.example.com/nuzlocke-assets npm run build
```

The storage bucket must contain these folders at the root:

- `img/**` from `src/img/**`
- `icons/**` from `src/assets/icons/**`

For example, `src/img/pikachu.jpg` should be available as:

```text
https://cdn.example.com/nuzlocke-assets/img/pikachu.jpg
```

and `src/assets/icons/pokemon/regular/pikachu.png` should be available as:

```text
https://cdn.example.com/nuzlocke-assets/icons/pokemon/regular/pikachu.png
```

When `VITE_STATIC_ASSETS_BASE_URL` is set, Vite skips copying those heavy folders into `dist/`. The small app shell assets under `assets/**` are still copied locally.

## Local fallback

If `VITE_STATIC_ASSETS_BASE_URL` is unset, the build keeps the historical behavior and copies `src/img/**` and `src/assets/icons/**` into `dist/` so local development works without storage credentials.

If another deployment layer mounts those folders at the same origin paths, set `VITE_COPY_LOCAL_IMAGE_ASSETS=false` to skip the copy without changing runtime URLs.

## CORS requirement

The external storage origin should send `Access-Control-Allow-Origin` for the app origin (or `*`). Result image export renders assets through canvas, so external images must be CORS-readable.
