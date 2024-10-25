// import { test, expect } from '@playwright/test';
// import { getTranslations } from '@translation/languageDetector.js';

// let translation;

// test.describe('Active Chats - Main Vertical Tabs Tests', () => {

//   test.beforeEach(async ({ page }) => {
//       await page.goto('https://admin.prod.buerokratt.ee/chat/active');
//       await page.waitForTimeout(3000);
//       translation = await getTranslations(page);
//   });

//   test('should display vertical tabs container', async ({ page }) => {
//     await expect(page.locator('.vertical-tabs')).toBeVisible();
//   });

//   test('should display "My chats" in the group header', async ({ page }) => {
//     const groupHeader = page.locator('.vertical-tabs__group-header');
//     await expect(groupHeader).toBeVisible();

//     const paragraph = groupHeader.locator('p');
//     await expect(paragraph).toHaveText("My chats");
//   });

//   test('should display placeholder text "Choose a chat to begin" in the body placeholder', async ({ page }) => {
//     const bodyPlaceholder = page.locator('.vertical-tabs__body-placeholder');
//     await expect(bodyPlaceholder).toBeVisible();

//     const paragraph = bodyPlaceholder.locator('p');
//     await expect(paragraph).toHaveText("Choose a chat to begin");
//   });

// });
