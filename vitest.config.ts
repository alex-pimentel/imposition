import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['packages/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**', 'tests/e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['packages/core/src/**/*.ts', 'packages/ui/src/**/*.ts'],
      exclude: ['**/*.d.ts', 'packages/ui/src/index.ts'],
      // Agenteresolve standard targets 60%. Current floor is set to the highest
      // level the suite already meets; raise it as coverage grows, never lower.
      thresholds: {
        lines: 90,
        functions: 90,
        statements: 90,
        branches: 75,
      },
    },
  },
});
