import { test, expect } from '@playwright/test';

const APP_URL = process.env.APP_URL || 'http://localhost:5173';

test.describe('Shared service shell', () => {
  test('renders header and footer without a Clerk key', async ({ page }) => {
    await page.goto(APP_URL);

    await expect(page.getByRole('banner')).toBeVisible();
    await expect(page.getByRole('contentinfo')).toBeVisible();
    await expect(page.getByRole('link', { name: /agenteresolve/i }).first()).toBeVisible();
  });

  test('degrades gracefully when Clerk is not configured', async ({ page }) => {
    await page.goto(APP_URL);

    // No publishable key is set: the UserButton falls back to a neutral label
    // instead of throwing, and the tool remains usable.
    await expect(page.getByRole('button', { name: /entrar/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /export pdf/i })).toBeVisible();
  });
});
