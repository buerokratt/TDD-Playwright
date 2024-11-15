import { test, expect } from '@playwright/test';
import { getTranslations } from '@translation/languageDetector.js';

let translation;

test.describe('Session Length', () => {
    test.beforeEach(async ({ page }) => {
        test.info().annotations.push({ type: 'repository', description: 'Session Length' });

        // Navigate to the page
        await page.goto('https://admin.prod.buerokratt.ee/chat/session-length');

        // Fetch translations
        translation = await getTranslations(page);

        // Wait for elements to load
        await page.waitForTimeout(3000);
    });

    test('should display the heading', async ({ page }) => {
        const heading = await page.getByRole('heading', {
            name: `${translation.sessionLength}`,
            exact: true,
        });
        await expect(heading).toBeVisible();
    });

    test('should display card body with paragraphs', async ({ page }) => {
        const cardBody = page.locator('.card__body').first();
        const paragraphs = cardBody.locator('p');

        for (let i = 0; i < await paragraphs.count(); i++) {
            await expect(paragraphs.nth(i)).toBeVisible();
        }
    });

    test('should display and validate label and input for session length', async ({ page }) => {
        const label = await page.getByText(`${translation.sessionLength}`, { exact: true }).nth(2);
        const input = await page.getByLabel(`${translation.sessionLength}`, { exact: true });

        await expect(label).toBeVisible();
        await expect(input).toBeVisible();

        // Capture current value, update it, and reset to original value
        const originalValue = await input.inputValue();
        await input.fill('30');
        await expect(input).toHaveValue('30');
        await input.fill(originalValue);
    });

    test('should display and validate save button', async ({ page }) => {
        const saveButton = await page.getByText(`${translation.save}`, { exact: true });
        await expect(saveButton).toBeVisible();

        // Test save button functionality
        await saveButton.click();
        // Add assertions to verify successful save action if required
    });
});
