import { test, expect } from '@playwright/test';
import { getTranslations } from '@translation/languageDetector.js';
let translations;


test.beforeEach(async ({ page }) => {
    await page.goto('https://admin.prod.buerokratt.ee/training/train-new-model');

    await page.waitForTimeout(4000);

    await expect(page).toHaveURL('https://admin.prod.buerokratt.ee/training/train-new-model');

    translations = await getTranslations(page);
});

test.describe('Visibility Tests for "Train new model"/"Treeni uus mudel" page', () => {
    test.skip('Check visibility of the header', async ({ page }) => {
        const header = page.locator(`h1:has-text("${translations.trainAndTest}")`);
        await expect(header).toBeVisible();
    });

    test('Check visibility of the last trained datetime and train now button', async ({ page }) => {
        const lastTrainedText = page.locator('p').filter({ hasText: new RegExp(`^${translations.lastTrained} .+`) });
        await expect(lastTrainedText).toBeVisible();

        const trainNowButton = page.locator(`.btn:has-text("${translations.trainNow}")`);
        await expect(trainNowButton).toBeVisible();
    });



    test('Check visibility of the training and testing data card which should include card header, and repeat training switch', async ({ page }) => {
        const card = page.locator('.card').first();
        await expect(card).toBeVisible();

        const cardHeader = card.locator(`.card__header:has-text("${translations.trainingAndTestingData}")`);
        await expect(cardHeader).toBeVisible();

        const repeatTrainingSwitch = page.locator(`label:has-text("${translations.repeatTraining}") + button.switch__button`);
        await expect(repeatTrainingSwitch).toBeVisible();
    });

    test('Check visibility of planned training card which should include card header, starting from date, days and training time', async ({ page }) => {
        const card = page.locator('.card').nth(1);
        await expect(card).toBeVisible();

        const cardHeader = card.locator(`.card__header:has-text("${translations.plannedTraining}")`);
        await expect(cardHeader).toBeVisible();

        const fromDateInput = page.locator(`label:has-text("${translations.from}") + div input`);
        await expect(fromDateInput).toBeVisible();

        // Check the span that contains the text "Nädalapäevad"
        const spanElement = card.locator(`span:has-text("${translations.days}")`);
        await expect(spanElement).toBeVisible();

        const mondayCheckbox = card.locator(`input[name="${translations.monday}"]`);
        await expect(mondayCheckbox).toBeVisible();

        const tuesdayCheckbox = card.locator(`input[name="${translations.tuesday}"]`);
        await expect(tuesdayCheckbox).toBeVisible();

        const wednesdayCheckbox = card.locator(`input[name="${translations.wednesday}"]`);
        await expect(wednesdayCheckbox).toBeVisible();

        const thursdayCheckbox = card.locator(`input[name="${translations.thursday}"]`);
        await expect(thursdayCheckbox).toBeVisible();

        const fridayCheckbox = card.locator(`input[name="${translations.friday}"]`);
        await expect(fridayCheckbox).toBeVisible();

        const saturdayCheckbox = card.locator(`input[name="${translations.saturday}"]`);
        await expect(saturdayCheckbox).toBeVisible();

        const sundayCheckbox = card.locator(`input[name="${translations.sunday}"]`);
        await expect(sundayCheckbox).toBeVisible();

        // Training time
        const trainingTimeInput = page.locator(`label:has-text("${translations.trainingTime}") + div input`);
        await expect(trainingTimeInput).toBeVisible();
    });
});



