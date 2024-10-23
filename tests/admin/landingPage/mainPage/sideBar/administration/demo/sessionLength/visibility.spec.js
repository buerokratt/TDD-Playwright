import { test, expect } from '@playwright/test';
import { getTranslations } from '@translation/languageDetector.js';

let translation;

test.describe('Session Length Settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://admin.prod.buerokratt.ee/chat/session-length');
    await page.waitForTimeout(3000);
    translation = await getTranslations(page);
  });

  test.describe('Header Section', () => {
    test('should display main heading', async ({ page }) => {
      const heading = await page.getByRole('heading', { 
        name: `${translation.sessionLength}` 
      });
      await expect(heading).toBeVisible();
    });
  });

  test.describe('Card Body Section', () => {
    test('should display session length input', async ({ page }) => {
      
      const input = await page.getByLabel(`${translation.sessionLength}`);
      
      await expect(input).toBeVisible();
      await expect(input).toHaveAttribute('type', 'number');
    });
  });

  test.describe('Card Footer Section', () => {
    test('should display save button', async ({ page }) => {
      const saveButton = await page.getByRole('button', { 
        name: `${translation.save}` 
      });
      await expect(saveButton).toBeVisible();
    });
  });
});