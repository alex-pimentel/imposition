# Shared UI shell + optional Clerk (subproject D)

## Summary

The web app (`packages/web`) now renders inside the shared Agenteresolve
`ServiceShell` and imports the shared design tokens. Login is **optional**: with
no `VITE_CLERK_PUBLISHABLE_KEY`, the shell shows a neutral sign-in fallback and
the imposition tool (including local PDF export) keeps working. Nothing is sent
to a server — there is still no backend or remote storage.

The Electron app is unchanged and does **not** consume `@agenteresolve/ui`.

## What changed

- `packages/web/package.json` — adds the git dependency
  `@agenteresolve/ui: github:alex-pimentel/agenteresolve-ui`.
- `packages/web/src/index.css` — imports Tailwind, then
  `@agenteresolve/ui/styles.css` (tokens) and `@imposition/ui/styles.css`.
- `packages/web/src/main.tsx` — wraps the app:
  `ServiceShell > App` with `publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}`.
- `packages/ui/src/App.tsx` — accepts an optional `className` so the web build
  can embed the workspace (`h-[calc(100vh-7rem)] w-full`) instead of the
  standalone `h-screen w-screen` frame. Default is unchanged for Electron/web.
- `packages/ui` no longer imports its CSS as a side effect from `index.ts`;
  consumers import `@imposition/ui/styles.css` explicitly (Electron renderer and
  the web `index.css` do so).
- `packages/web/index.html` — CSP extended with the Clerk / Cloudflare Turnstile
  hosts. They are inert unless a publishable key is configured.
- `tests/e2e/shell.spec.ts` — asserts the header/footer render and the no-Clerk
  fallback degrades gracefully.

## Environment

```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...   # optional; public key only
```

Never put `CLERK_SECRET_KEY` in a frontend build. No secret belongs in the repo.

## Known upstream issue — `@agenteresolve/ui` build is broken

`@agenteresolve/ui@0.1.0` (main `03587e4`) has a broken `dist/index.js`: its Vite
library build externalizes relative source imports, so the entry re-exports
`./lib/cn.ts`, `./components/ui/button.tsx`, etc. — files that are **not** in the
package (`dist` only contains `.d.ts` + the shim). Consuming it directly fails:

```
Could not resolve "./lib/cn.ts" from "node_modules/@agenteresolve/ui/dist/index.js"
```

Root cause: in `vite.config.ts` the `rollupOptions.external` predicate
`(id) => !id.startsWith('.')` never bundles relative modules because Vite/Rollup
passes _resolved absolute_ ids (`!id.startsWith('/')` is also required).

### Workaround in place

- The design tokens are used from the real package (`@agenteresolve/ui/styles.css`).
- The package's components (`ServiceShell`, `AuthProvider`, `UserButton`, …) are
  used via a **vendored corrected build** at
  `packages/web/src/vendor/agenteresolve-ui/index.js`, produced from the same
  upstream source (commit `03587e4`) with a fixed `external` predicate. The web
  Vite config aliases the exact specifier `@agenteresolve/ui` to it; the
  `@agenteresolve/ui/styles.css` deep import still resolves to the package.
- Type-checking still uses the package's shipped `dist/index.d.ts`.

Regenerate the vendored file from the upstream repo:

```ts
// vite.bundle.config.ts (in a checkout of agenteresolve-ui)
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    emptyOutDir: false,
    lib: { entry: 'src/index.ts', formats: ['es'], fileName: () => 'index.bundle.js' },
    rollupOptions: {
      external: (id) => !id.startsWith('.') && !id.startsWith('/') && !id.startsWith('\0'),
    },
  },
});
```

```sh
npx vite build --config vite.bundle.config.ts
```

Then copy `dist/index.bundle.js` over `packages/web/src/vendor/agenteresolve-ui/index.js`.

Remove the alias and the vendored file once upstream fixes its build (then the
plain `import { ServiceShell } from '@agenteresolve/ui'` resolves directly).

## Validation

- `npm run lint` ✅
- `npx tsc --noEmit -p packages/web/tsconfig.json` ✅
- `npm run build -w packages/web` ✅
- `npx playwright test` ✅ (5 tests; requires `LD_LIBRARY_PATH` for Chromium
  system libs in this sandbox — CI uses `playwright install --with-deps`)
- `npm audit` reports pre-existing Electron/webpack advisories (high/critical),
  plus a high advisory on the deprecated `@clerk/clerk-react` pulled in by
  `@agenteresolve/ui` (upstream should migrate to `@clerk/react`).
