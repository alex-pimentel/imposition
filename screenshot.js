const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });

  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const styles = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('style'))
      .map((s) => s.textContent)
      .join('\n\n---\n\n');
  });

  fs.writeFileSync('/tmp/opencode/tailwind-dev.css', styles);

  const screenshot = await page.screenshot({ fullPage: true });
  fs.writeFileSync('/tmp/opencode/screenshot.png', screenshot);
  console.log('Saved CSS and screenshot');

  await browser.close();
})();
