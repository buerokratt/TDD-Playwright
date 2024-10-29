import { test, expect } from '@playwright/test';
import { getTranslations } from '@translation/languageDetector.js';

let translation;

test.describe('Emergency Notices', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('https://admin.prod.buerokratt.ee/chat/chatbot/emergency-notices');
        translation = await getTranslations(page);
        await page.waitForTimeout(3000);
    });

    test('Heading verification', async ({ page }) => {
        const heading = await page.getByRole('heading', { name: `${translation.emergencyNotices}` });
        await expect(heading).toBeVisible();
    });

    test.describe('Card Body', () => {
        test('Notice active switch visibility', async ({ page }) => {
            const label = await page.getByText(`${translation.noticeActive}`);
            const switchButton = await page.locator(`label:has-text("${translation.noticeActive}") + button.switch__button`);
            await expect(label).toBeVisible();
            await expect(switchButton).toBeVisible();
        });

        test('Notice textarea visibility', async ({ page }) => {
            
            const label = await page.getByText(`${translation.notice}`, { exact: true });
            const textarea = await page.getByLabel(`${translation.notice}`, { exact: true });
            await expect(label).toBeVisible();
            await expect(textarea).toBeVisible();
        });

        test('Display period label and input visibility', async ({ page }) => {
            const displayPeriodLabel = await page.getByText(`${translation.displayPeriod}`);
            const displayPeriodInput = await page.getByLabel(`${translation.displayPeriod}`);
            await expect(displayPeriodLabel).toBeVisible();
            await expect(displayPeriodInput).toBeVisible();
        });

        test('To date input visibility', async ({ page }) => {
            const toLabel = await page.getByText(`${translation.to}`);
            const toInput = await page.getByLabel(`${translation.to}`);
            await expect(toLabel).toBeVisible();
            await expect(toInput).toBeVisible();
        });
    });

    test.describe('Card Footer', () => {
        test('Save button visibility', async ({ page }) => {
            const saveButton = await page.getByRole('button', { name: `${translation.save}` });
            await expect(saveButton).toBeVisible();
        });
    });
});
