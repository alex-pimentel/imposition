import { test, expect } from '@playwright/test';

const APP_URL = process.env.APP_URL || 'http://localhost:1212';

test.describe('Imposition app', () => {
  test('renders the main layout and controls', async ({ page }) => {
    await page.goto(APP_URL);

    await expect(page).toHaveTitle(/Imposition|Hello Electron React/i);
    await expect(page.getByText('Imposition')).toBeVisible();
    await expect(
      page.getByRole('button', { name: /Posicionar automaticamente/i }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: /Exportar PDF/i }),
    ).toBeVisible();
  });

  test('shows empty state before importing images', async ({ page }) => {
    await page.goto(APP_URL);
    await expect(page.getByText('Nenhum item selecionado')).toBeVisible();
    await expect(page.getByText(/itens/i)).toContainText('0 itens');
  });

  test('imports images dropped into the upload area', async ({ page }) => {
    await page.goto(APP_URL);

    const filePath = 'tests/e2e/assets/sample.png';
    const dropZone = page.locator('label.upload-button');

    await dropZone.evaluate((element) => {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(
        new File(['sample'], 'sample.png', { type: 'image/png' }),
      );

      element.dispatchEvent(
        new DragEvent('dragenter', {
          bubbles: true,
          cancelable: true,
          dataTransfer,
        }),
      );
      element.dispatchEvent(
        new DragEvent('dragover', {
          bubbles: true,
          cancelable: true,
          dataTransfer,
        }),
      );
    });

    await expect(page.getByText('Solte as imagens aqui')).toBeVisible();

    await page.locator('#image-import').setInputFiles(filePath);
    await page.locator('#image-import').dispatchEvent('change', {
      bubbles: true,
    });

    await expect(page.getByText(/1 itens/i)).toBeVisible();
  });
});
