import { test, expect } from '@playwright/test';
import { getTranslations } from '@translation/languageDetector';

let translation 

test.beforeEach(async ({ page }) => {

    await page.goto('https://admin.prod.buerokratt.ee/training/training/intents');

    await page.waitForTimeout(4000);

    await expect(page).toHaveURL('https://admin.prod.buerokratt.ee/training/training/intents');

    translation = await getTranslations(page);

});

test("should have all subtabs visible", async ({ page }) => {
    await expect(page.getByRole('button', { name: translation.training }).nth(1)).toBeVisible();
    await expect(page.getByRole('button', { name: translation.historicalConversations })).toBeVisible();
    await expect(page.getByRole('button', { name: translation.modelbankAndAnalysis })).toBeVisible();
    await expect(page.getByRole('link', { name: translation.trainNewModel })).toBeVisible();
})