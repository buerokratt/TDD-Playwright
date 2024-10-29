import { test, expect } from '@playwright/test';
import { getTranslations } from '@translation/languageDetector.js';

let translation;

test.describe('Appearance and Behaviour', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('https://admin.prod.buerokratt.ee/chat/chatbot/appearance');
        translation = await getTranslations(page);
        await page.waitForTimeout(3000);
    });

    test.describe('Heading', () => {
        test('should display the heading with correct text', async ({ page }) => {
            const heading = await page.getByRole('heading', { name: `${translation.appearanceAndBehaviour}`, exact: true });
            await expect(heading).toBeVisible();
        });
    });

    test.describe('Card Body', () => {
        test('should display inputs and switches with correct labels', async ({ page }) => {
            // Widget Proactive Seconds
            const proactiveSecondsLabel = await page.getByText(`${translation.widgetProactiveSeconds}`, { exact: true });
            const proactiveSecondsInput = await page.getByLabel(`${translation.widgetProactiveSeconds}`, { exact: true });
            await expect(proactiveSecondsLabel).toBeVisible();
            await expect(proactiveSecondsInput).toBeVisible();

            // Widget Bubble Message Text - Switch
            const bubbleMessageLabel = await page.getByText(`${translation.widgetBubbleMessageText}`).nth(0);
            const bubbleMessageSwitch = await page.getByText(`${translation.widgetBubbleMessageText}`).nth(0);
            await expect(bubbleMessageLabel).toBeVisible();
            await expect(bubbleMessageSwitch).toBeVisible();

            // Widget Bubble Message Seconds
            const bubbleMessageSecondsLabel = await page.getByText(`${translation.widgetBubbleMessageSeconds}`, { exact: true });
            const bubbleMessageSecondsInput = await page.getByLabel(`${translation.widgetBubbleMessageSeconds}`, { exact: true });
            await expect(bubbleMessageSecondsLabel).toBeVisible();
            await expect(bubbleMessageSecondsInput).toBeVisible();

            // Widget Bubble Message Text - Input
            const bubbleMessageTextLabel = await page.getByText(`${translation.widgetBubbleMessageText}`).nth(1);
            const bubbleMessageTextInput = await page.getByLabel(`${translation.widgetBubbleMessageText}`, { exact: true }).nth(1);
            await expect(bubbleMessageTextLabel).toBeVisible();
            await expect(bubbleMessageTextInput).toBeVisible();

            // Widget Color
            const colorLabel = await page.getByText(`${translation.widgetColor}`, { exact: true });
            const colorInput = await page.getByLabel(`${translation.widgetColor}`, { exact: true });
            await expect(colorLabel).toBeVisible();
            await expect(colorInput).toBeVisible();
        });

        test('should display the dropdown with correct label and options', async ({ page }) => {
            const animationSelect = await page.getByRole('combobox', { name: `${translation.widgetAnimation}`, exact: true });
            await expect(animationSelect).toBeVisible();
        });
    });

    test.describe('Card Footer', () => {
        test('should display Save and Preview buttons', async ({ page }) => {
            const saveButton = await page.getByText(`${translation.save}`, { exact: true });
            const previewButton = await page.getByText(`${translation.preview}`, { exact: true });
            await expect(saveButton).toBeVisible();
            await expect(previewButton).toBeVisible();
        });
    });
});
