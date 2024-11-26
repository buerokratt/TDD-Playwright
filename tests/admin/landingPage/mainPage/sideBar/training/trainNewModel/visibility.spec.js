import { test, expect } from '@playwright/test';
import { getTranslations } from '@translation/languageDetector.js';

test.describe('Training-Module', () => {
    let translation;

    test.beforeEach(async ({ page }) => {
        test.info().annotations.push({ type: 'repository', description: 'Training-Module' });
        await page.goto('https://admin.prod.buerokratt.ee/training/train-new-model');
        translation = await getTranslations(page);
        await page.waitForTimeout(3000);
    });

    test.describe('Main Heading and Buttons', () => {
        test('should display the main heading and buttons correctly', async ({ page }) => {
            const heading = await page.getByRole('heading', { name: `${translation.trainingAndTest}`, exact: true });
            const trainButton = await page.getByText(`${translation.train}`, { exact: true });
            const trainAndTestButton = await page.getByText(`${translation.trainAndTest}`, { exact: true });

            await expect(heading).toBeVisible();
            await expect(trainButton).toBeVisible();
            await expect(trainAndTestButton).toBeVisible();
        });
    });

    test.describe('Card: Training and Testing Data', () => {
        test('should handle card elements correctly', async ({ page }) => {
            const cardHeader = await page.locator('.card__header').getByText(`${translation.trainingAndTestingData}`, { exact: true });
            await expect(cardHeader).toBeVisible();

            const cardBody = page.locator('.card__body').first();
            const switchLabel = await cardBody.getByText(`${translation.repeatTraining}`, { exact: true });
            const switchButton = await cardBody.getByLabel(`${translation.repeatTraining}`, { exact: true });

            await expect(switchLabel).toBeVisible();
            await expect(switchButton).toBeVisible();
        });
    });

    test.describe('Card: Planned Training', () => {
        test('should handle inputs and dropdowns', async ({ page }) => {
            const cardHeader = await page.locator('.card__header').getByText(`${translation.plannedTraining}`, { exact: true });
            await expect(cardHeader).toBeVisible();

            const cardBody = page.locator('.card__body').nth(1);
            const startingFromLabel = await cardBody.getByText(`${translation.startingFrom}`, { exact: true });
            const startingFromInput = await cardBody.getByLabel(`${translation.startingFrom}`, { exact: true });
            const trainingTimeLabel = await cardBody.getByText(`${translation.trainingTime}`, { exact: true });
            const trainingTimeInput = await cardBody.getByLabel(`${translation.trainingTime}`, { exact: true });

            await expect(startingFromLabel).toBeVisible();
            await expect(startingFromInput).toBeVisible();
            await expect(trainingTimeLabel).toBeVisible();
            await expect(trainingTimeInput).toBeVisible();

            const daysSelect = await cardBody.getByText(`${translation.days}`, { exact: true });
            await expect(daysSelect).toBeVisible();

            const options = [
                `${translation.monday}`, `${translation.tuesday}`, `${translation.wednesday}`,
                `${translation.thursday}`, `${translation.friday}`, `${translation.saturday}`,
                `${translation.sunday}`
            ];

            for(const option of options) {
            const checkbox = await cardBody.locator(`input[name='${option}']`);
            await expect(checkbox).toBeVisible();
            }
        });
    });

    test.describe('Bottom Section', () => {
        test('should display the save button correctly', async ({ page }) => {
            const saveButton = await page.getByText(`${translation.save}`, { exact: true });
            await expect(saveButton).toBeVisible();
        });
    });
});
