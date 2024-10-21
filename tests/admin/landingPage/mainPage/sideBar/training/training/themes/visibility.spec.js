import { test, expect } from '@playwright/test';
import { getTranslations } from '@translation/languageDetector.js';
import { selectFirstChat } from '../../../conversations/unanswered/helper';
let translations;
let hasElements = false;

test.beforeEach(async ({ page }) => {
    await page.goto('https://admin.prod.buerokratt.ee/training/training/intents');

    await page.waitForTimeout(4000);

    await expect(page).toHaveURL('https://admin.prod.buerokratt.ee/training/training/intents');

    translations = await getTranslations(page);
});

test.describe('Visibility Tests for "Themes"/"Teemad" left vertical tab', () => {
    test('should have themes vertical listing tab', async ({ page }) => {
        const verticalTabs = page.locator('div.vertical-tabs__list');
        await expect(verticalTabs).toBeVisible();
    })

    test('Check visibility of the header', async ({ page }) => {
        const header = page.locator(`h1:has-text("${translations.intents}")`);
        await expect(header).toBeVisible();
    });

    test('should have vertical tabs - navigation list and result selected element description', async ({ page }) => {
        const verticalTabs = page.locator('div.vertical-tabs');
        await expect(verticalTabs).toBeVisible();
    })

    test('should have in vertical listing tab search input', async ({ page }) => {
        const searchInput = page.locator('input[name="intentSearch"]');
        await expect(searchInput).toBeVisible();
    })

    test('should have in vertical listing tab add button', async ({ page }) => {
        const addButton = page.locator(`button.btn--primary:has-text("${translations.add}")`);
        await expect(addButton).toBeVisible();
    });
});


test.describe('Visibility Tests for "Themes"/"Teemad" right vertical tab', async () => {
    test.beforeEach(async ({ page }) => {
        hasElements = await selectFirstChat(page);
        test.skip(!hasElements, 'No listing elements found');
    });

    test('should have vertical tab content header', async ({ page }) => {
        const contentHeader = page.locator('.vertical-tabs__content-header');
        await expect(contentHeader).toBeVisible();
    })


    test('should have vertical tab title (name) and change button', async ({ page }) => {
        const title = page.locator('.track h3');
        await expect(title).toBeVisible();

        const editButton = page.locator(`.track .btn:has-text("${translations.edit}")`);
        await expect(editButton).toBeVisible();
    })

    test('should have vertical tab examples upload examples, download examples, add to model, delete buttons', async ({ page }) => {
        const uploadExamplesButton = page.locator(`.track .btn:has-text("${translations.uploadExamples}")`);
        await expect(uploadExamplesButton).toBeVisible();

        const downloadExamplesButton = page.locator(`.track .btn:has-text("${translations.downloadExamples}")`);
        await expect(downloadExamplesButton).toBeVisible();

        //const addToModelButton = page.locator(`.track .btn:has-text("${translations.addToModel}")`);
        //await expect(addToModelButton).toBeVisible();

        const deleteButton = page.locator(`.track .btn:has-text("${translations.delete}")`);
        await expect(deleteButton).toBeVisible();
    })


    test('should have vertical tab content section', async ({ page }) => {
        const verticalTabsContent = page.locator('div.vertical-tabs__content');
        await expect(verticalTabsContent).toBeVisible();
    })


    test('should have vertical tab data-table', async ({ page }) => {
        const table = page.locator('.data-table');
        await expect(table).toBeVisible();
    })

    test('should have in vertical tab data-table text area with defined max length', async ({ page }) => {
        const table = page.locator('.data-table');
        const textarea = table.locator(`textarea[placeholder="${translations.addNew}"]`);
        await expect(textarea).toBeVisible();
        await expect(textarea).toHaveAttribute('maxlength', '600');
    })

    test('should have in vertical tab data-table disabled add button if text area is empty', async ({ page }) => {
        const table = page.locator('.data-table');
        const textarea = table.locator(`textarea[placeholder="${translations.addNew}"]`);
        const button = table.locator(`.btn:has-text("${translations.add}")`);

        const textAreaValue = await textarea.inputValue();
        if (textAreaValue === '') {
            await expect(button).toBeVisible();
            await expect(button).toBeDisabled();
        }


    })

    test('should have in vertical tab data-table enabled add button if text area is not empty', async ({ page }) => {
        const table = page.locator('.data-table');
        const textarea = table.locator(`textarea[placeholder="${translations.addNew}"]`);
        const button = table.locator(`.btn:has-text("${translations.add}")`);

        await textarea.fill('Test text');
        await expect(button).toBeVisible(); 
        await expect(button).toBeEnabled();

        
    })


});

