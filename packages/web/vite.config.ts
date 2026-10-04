import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// The git dependency @agenteresolve/ui ships a broken dist/index.js (it
// re-exports .ts/.tsx files that are not in the tarball). We consume its CSS
// tokens from the package and its components from a vendored corrected build.
// Remove this alias once upstream fixes its build. See dev-docs/shared-shell.md.
const sharedUiBundle = fileURLToPath(
  new URL('./src/vendor/agenteresolve-ui/index.js', import.meta.url),
);

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [{ find: /^@agenteresolve\/ui$/, replacement: sharedUiBundle }],
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
