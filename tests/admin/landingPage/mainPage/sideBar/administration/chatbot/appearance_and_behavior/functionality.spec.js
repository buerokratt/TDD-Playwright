import { test, expect } from '@playwright/test';
import { getTranslations } from '@translation/languageDetector.js';

let translation;

test.describe('Buerokratt-Chatbot Appearance and Behaviour Tests', () => {
    test.beforeEach(async ({ page }) => {
        test.info().annotations.push({ type: 'repository', description: 'Buerokratt-Chatbot' });
        await page.goto('https://admin.prod.buerokratt.ee/chat/chatbot/appearance');
        translation = await getTranslations(page);
        await page.waitForTimeout(3000); // Ensures all elements load properly
    });

    test.describe('Heading', () => {
        test('should display the heading', async ({ page }) => {
            const heading = await page.getByRole('heading', { name: `${translation.appearanceAndBehaviour}`, exact: true });
            await expect(heading).toBeVisible();
        });
    });

    test.describe('Card Body', () => {
        let cardBody;

        test.beforeEach(async ({ page }) => {
            cardBody = page.locator('.card__body');
        });

        test('should display widget proactive seconds input', async ({ page }) => {
            const label = cardBody.getByText(`${translation.widgetProactiveSeconds}`, { exact: true });
            const input = cardBody.getByLabel(`${translation.widgetProactiveSeconds}`, { exact: true });
            await expect(label).toBeVisible();
            await expect(input).toBeVisible();
        });

        test('should display widget bubble message text switch', async ({ page }) => {
            const label = cardBody.getByText(`${translation.widgetBubbleMessageText}`, { exact: true }).nth(0);
            const switchButton = cardBody.getByLabel(`${translation.widgetBubbleMessageText}`, { exact: true }).nth(0);
            await expect(label).toBeVisible();
            await expect(switchButton).toBeVisible();
        });

        test('should display widget bubble message seconds input', async ({ page }) => {
            const label = cardBody.getByText(`${translation.widgetBubbleMessageSeconds}`, { exact: true });
            const input = cardBody.getByLabel(`${translation.widgetBubbleMessageSeconds}`, { exact: true });
            await expect(label).toBeVisible();
            await expect(input).toBeVisible();
        });

        test('should display widget bubble message text input', async ({ page }) => {
            const label = cardBody.getByText(`${translation.widgetBubbleMessageText}`, { exact: true }).nth(1);
            const input = cardBody.getByLabel(`${translation.widgetBubbleMessageText}`, { exact: true }).nth(1);
            await expect(label).toBeVisible();
            await expect(input).toBeVisible();
        });

        test('should display widget color input', async ({ page }) => {
            const label = cardBody.getByText(`${translation.widgetColor}`, { exact: true });
            const input = cardBody.getByLabel(`${translation.widgetColor}`, { exact: true });
            await expect(label).toBeVisible();
            await expect(input).toBeVisible();
        });

        test('should display widget animation dropdown', async ({ page }) => {
            const select = cardBody.getByRole('combobox', { name: `${translation.widgetAnimation}`, exact: true });
            await expect(select).toBeVisible();
            await select.click();
            const options = ['Jump', 'Shockwave', 'Wiggle'];
            for (const option of options) {
                const optionElement = page.getByText(option, { exact: true });
                await expect(optionElement).toBeVisible();
            }
        });
    });

    test.describe('Card Footer', () => {
        let cardFooter;

        test.beforeEach(async ({ page }) => {
            cardFooter = page.locator('.card__footer');
        });

        test('should display save and preview buttons', async ({ page }) => {
            const saveButton = cardFooter.getByText(`${translation.save}`, { exact: true });
            const previewButton = cardFooter.getByText(`${translation.preview}`, { exact: true });
            await expect(saveButton).toBeVisible();
            await expect(previewButton).toBeVisible();
        });
    });
});
