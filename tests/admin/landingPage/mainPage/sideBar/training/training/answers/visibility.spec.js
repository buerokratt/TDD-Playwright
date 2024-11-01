import { test, expect } from '@playwright/test';
import { getTranslations } from '@translation/languageDetector.js';
import { selectFirstChat } from '../../../conversations/unanswered/helper';
let translations;
let headers;

test.beforeEach(async ({ page }) => {
    test.info().annotations.push({ type: 'repository', description: 'Training-Module' });

    await page.goto('https://admin.prod.buerokratt.ee/training/training/responses');

    await page.waitForTimeout(4000);

    await expect(page).toHaveURL('https://admin.prod.buerokratt.ee/training/training/responses');

    translations = await getTranslations(page);

    headers = [
        new RegExp(translations.response)
    ];
});

test.describe('Visibility Tests for "Answers"/"Vastused" page', () => {
    test('Check visibility of the header', async ({ page }) => {
        const header = page.locator(`h1:has-text("${translations.responses}")`);
        await expect(header).toBeVisible();
    });

    test('Check visibility of the header card which should include search field and add button', async ({ page }) => {
        const card = page.locator('.card').first();
        await expect(card).toBeVisible();

        const searchField = page.getByPlaceholder(`${translations.searchResponse}`);
        await expect(searchField).toBeVisible();
        await expect(searchField).toHaveAttribute('placeholder', `${translations.searchResponse}`);

        const addButton = page.locator(`.track .btn:has-text("${translations.add}")`);
        await expect(addButton).toBeVisible();
    });

    test('Check if the table and all headers are rendered', async ({ page }) => {
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




