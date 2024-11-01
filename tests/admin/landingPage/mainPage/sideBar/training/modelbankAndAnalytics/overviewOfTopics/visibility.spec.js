import { test, expect } from '@playwright/test';
import { getTranslations } from '@translation/languageDetector.js';
import { selectFirstChat } from '../../../conversations/unanswered/helper';
let translations;
let headers;

test.beforeEach(async ({ page }) => {
    test.info().annotations.push({ type: 'repository', description: 'Training-Module' });

    await page.goto('https://admin.prod.buerokratt.ee/training/analytics/overview');

    await page.waitForTimeout(4000);

    await expect(page).toHaveURL('https://admin.prod.buerokratt.ee/training/analytics/overview');

    translations = await getTranslations(page);

    headers = [
        new RegExp(translations.intent), new RegExp(translations.examples), new RegExp(translations.f1Score),
    ];
});

test.describe('Visibility Tests for "Overview of Topics"/"Teemade ülevaade" page', () => {
    test('Check visibility of the header', async ({ page }) => {
        const header = page.locator(`h1:has-text("${translations.intentsOverview}")`);
        await expect(header).toBeVisible();
    });

    test('Check visibility of the header details card which should include Report overview select and trained data ', async ({ page }) => {
        const card = page.locator('.card').first();
        await expect(card).toBeVisible();

        const label = page.locator(`label:has-text("${translations.reportOverview}")`);
        await expect(label).toBeVisible();

        const selectElement = card.locator('div.select');
        await expect(selectElement).toBeVisible();

        const pElement = card.locator(`p:has-text("${translations.modelInUse}")`);
        await expect(pElement).toBeVisible();

        const pElement2 = page.locator('p').filter({ hasText: new RegExp(`^${translations.trained}(?=\\s*:)`) });
        await expect(pElement2).toBeVisible();

    });

    test('Check visibility of the header card which should include search field', async ({ page }) => {
        const card = page.locator('.card').nth(1);
        await expect(card).toBeVisible();

        const searchField = card.getByPlaceholder(`${translations.dottedSearch}`);
        await expect(searchField).toBeVisible();
        await expect(searchField).toHaveAttribute('placeholder', `${translations.dottedSearch}`);
    });
    test('Check if the table and all headers are rendered', async ({ page }) => {


        const table = page.locator('table.data-table');
        await expect(table).toBeVisible();

        for (const header of headers) {
            const headerElement = table.locator('th').filter({ hasText: header });
            await expect(headerElement).toBeVisible();
        }
    });


    test.skip('Check if sorting buttons are present in each column', async ({ page }) => {
        for (const header of headers) {
            const sortingButton = page.locator('th').filter({ hasText: header }).locator('button');
            await expect(sortingButton).toBeVisible();
        }
    });

});



