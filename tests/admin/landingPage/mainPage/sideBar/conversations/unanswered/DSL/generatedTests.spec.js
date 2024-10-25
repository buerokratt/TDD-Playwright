// import { test, expect } from '@playwright/test';
// import { getTranslations } from '@translation/languageDetector.js';
// import { selectFirstChat } from '../../unanswered/helper.js';

// let translation;

// test.describe('Unanswered Chats Visibility Tests', () => {

//     test.beforeEach(async ({ page }) => {
//         await page.goto('https://admin.prod.buerokratt.ee/chat/unanswered');
//         await page.waitForTimeout(3000);
        
//         const switchButton = await page.locator('.switch__button');
//         const isChecked = await switchButton.getAttribute('aria-checked');
//         if (isChecked !== 'true') {
//             await switchButton.click();
//         }
//         await selectFirstChat(page);
//         translation = await getTranslations(page);
//     });

//     test('Verify main vertical tabs elements', async ({ page }) => {
//         await expect(page.locator('.vertical-tabs')).toBeVisible();
//         await expect(page.locator('.vertical-tabs__list')).toBeVisible();
//         await expect(page.locator('.vertical-tabs__body-placeholder')).toHaveText("Choose a chat to begin");
//     });

//     test.describe('Selected Chat Details Section', () => {
//         test('Verify selected chat elements', async ({ page }) => {
//             const chatBody = page.locator('.active-chat__body');
//             await expect(chatBody).toBeVisible();
//             await expect(chatBody.locator('h3:has-text("Header title")')).toBeVisible();
//             await expect(chatBody.locator('p:has-text("Header paragraph")')).toBeVisible();
//         });
//     });

//     test.describe('Chat Toolbar Section', () => {
//         test('Verify toolbar buttons', async ({ page }) => {
//             await expect(page.locator('.active-chat__toolbar button:has-text("Take Over")')).toBeVisible();
//         });
//     });

//     test.describe('Side Action Buttons Section', () => {
//         test('Verify side action buttons', async ({ page }) => {
//             await expect(page.locator('.active-chat__side-actions button:has-text("End chat")')).toBeVisible();
//             await expect(page.locator('.active-chat__side-actions button:has-text("Ask Authentication")')).toBeVisible();
//             await expect(page.locator('.active-chat__side-actions button:has-text("Ask Contact Information")')).toBeVisible();
//             await expect(page.locator('.active-chat__side-actions button:has-text("Ask Permission")')).toBeVisible();
//             await expect(page.locator('.active-chat__side-actions button:has-text("Forward to Colleague")')).toBeVisible();
//         });
//     });

//     test.describe('Meta Information Section', () => {
//         test('Verify meta information in side meta section', async ({ page }) => {
//             const metaSection = page.locator('.active-chat__side-meta');
//             await expect(metaSection.locator('p:has-text("Id")')).toBeVisible();
//             await expect(metaSection.locator('p:has-text("End user name")')).toBeVisible();
//             await expect(metaSection.locator('p:has-text("Chat started at")')).toBeVisible();
//             await expect(metaSection.locator('p:has-text("Device")')).toBeVisible();
//             await expect(metaSection.locator('p:has-text("Location")')).toBeVisible();
//         });
//     });

// });
