import { test, expect } from '@playwright/test';
import { getTranslations } from '@translation/languageDetector.js';
import { selectFirstChat } from '../../../conversations/unanswered/helper';
let translations;
let headers;

test.beforeEach(async ({ page }) => {
    test.info().annotations.push({ type: 'repository', description: 'Training-Module' });

    await page.goto('https://admin.prod.buerokratt.ee/training/analytics/models');

    await page.waitForTimeout(4000);

    await expect(page).toHaveURL('https://admin.prod.buerokratt.ee/training/analytics/models');

    translations = await getTranslations(page);

    headers = [
        new RegExp(translations.version), new RegExp(translations.name), new RegExp(translations.lastTrained),
        new RegExp(translations.live)
    ];
});

test.describe('Visibility Tests for "Models"/"Mudelid" page', () => {
    test('Check visibility of the header', async ({ page }) => {
        const header = page.locator(`h1:has-text("${translations.models}")`);
        await expect(header).toBeVisible();
    });

    test('Check visibility of the selected model card which should include card header, selected version, and delete button', async ({ page }) => {
        const card = page.locator('.card').first();
        await expect(card).toBeVisible();

        const cardHeader = card.locator(`.card__header:has-text("${translations.selectedModel}")`);
        await expect(cardHeader).toBeVisible();

        const cardBody = card.locator('.card__body');
        await expect(cardBody).toBeVisible();

        const versionText = cardBody.locator('p').filter({ hasText: new RegExp(`${translations.version} \\d+_\\d+`) });
        await expect(versionText).toBeVisible();

        const deleteButton = cardBody.locator(`.btn:has-text("${translations.delete}")`);
        await expect(deleteButton).toBeVisible();
        await expect(deleteButton).toBeDisabled();
    });

    test('Check visibility of the all models card header', async ({ page }) => {
        const card = page.locator('.card').nth(1);
        await expect(card).toBeVisible();

        const cardHeader = card.locator(`.card__header:has-text("${translations.allModels}")`);
        await expect(cardHeader).toBeVisible();
    });

    test('Check if the all models table and all headers are rendered', async ({ page }) => {
        const table = page.locator('table.data-table');
        await expect(table).toBeVisible();

        for (const header of headers) {
            const headerElement = table.locator('th').filter({ hasText: header });
            await expect(headerElement).toBeVisible();
        }
    });


    test('Check if sorting buttons are present in each column', async ({ page }) => {
        for (const header of headers) {
            const sortingButton = page.locator('th').filter({ hasText: header }).locator('button');
            await expect(sortingButton).toBeVisible();
        }
    });

});



