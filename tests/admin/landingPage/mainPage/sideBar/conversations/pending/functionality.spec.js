import { test, expect } from '@playwright/test';
import { getTranslations } from '@translation/languageDetector.js';
import {
    turnSwitchOn,
    changeOpenHoursToClosed,
    letQuestion,
} from '../unanswered/helper';

let translation;


test.describe('Buerokratt-Chatbot New Chats', () => {
    test.beforeEach(async ({ page }) => {
        test.info().annotations.push({ type: 'repository', description: 'Buerokratt-Chatbot' });
        await changeOpenHoursToClosed();
        await letQuestion(page);
        await page.goto('https://admin.prod.buerokratt.ee/chat/pending');
        await page.waitForTimeout(3000);
        await turnSwitchOn(page);
        await page.waitForTimeout(1000);
        translation = await getTranslations(page);


    });


    test.describe('Chats take over', () => {
        test('should move new chat in process chats when take over button clicked', async ({ page }) => {
            const inProcessHeader = await page.locator('.vertical-tabs__group-header', { hasText: `${translation.inProcess}` });
            const buttonsBeforeInProcess = await inProcessHeader.locator('xpath=preceding-sibling::button');
            const buttonsAfterInProcess = await inProcessHeader.locator('xpath=following-sibling::button');
            const newChatsCount = await buttonsBeforeInProcess.count()
            const inProcessChatsCount = await buttonsAfterInProcess.count()

            if (buttonsBeforeInProcess.first()) {
                await buttonsBeforeInProcess.first().click();
            }

            const takeOverButton = page.locator('.active-chat__toolbar').getByText(`${translation.takeOver}`, { exact: true });
            await expect(takeOverButton).toBeVisible();

            await takeOverButton.click()
            await page.waitForTimeout(3000);

            await expect(newChatsCount - await buttonsBeforeInProcess.count()).toBe(1)
            await expect(await buttonsAfterInProcess.count() - inProcessChatsCount).toBe(1)

        });


        test('Could Not Reach User button action should remove chat from chats list', async ({ page }) => {
            const inProcessHeader = await page.locator('.vertical-tabs__group-header', { hasText: `${translation.inProcess}` });
            const inProcessChats = await inProcessHeader.locator('xpath=following-sibling::button');
            const inProcessChatsCountBeforeButtonClick = await inProcessChats.count()
            if (inProcessChats.first()) {
                await inProcessChats.first().click()
            }
            const contactedUserButton = page.locator('.active-chat__toolbar').getByText(`${translation.couldNotReachUser}`, { exact: true });
            await expect(contactedUserButton).toBeVisible();
            await contactedUserButton.click()
            await page.waitForTimeout(5000);

            await expect(inProcessChatsCountBeforeButtonClick - await inProcessChats.count()).toBe(1)
        });

        test('Contacted user button action should remove chat from chats list', async ({ page }) => {
            const inProcessHeader = await page.locator('.vertical-tabs__group-header', { hasText: `${translation.inProcess}` });
            const inProcessChats = await inProcessHeader.locator('xpath=following-sibling::button');
            const inProcessChatsCountBeforeButtonClick = await inProcessChats.count()
            if (inProcessChats.first()) {
                await inProcessChats.first().click()
            }
            const contactedUserButton = page.locator('.active-chat__toolbar').getByText(`${translation.contactedUser}`, { exact: true });
            await expect(contactedUserButton).toBeVisible();
            await contactedUserButton.click()
            await page.waitForTimeout(5000);

            expect(inProcessChatsCountBeforeButtonClick - await inProcessChats.count()).toBe(1)
        });


        test.only('Contacted user button action should add to history', async ({ page }) => {
            const inProcessHeader = await page.locator('.vertical-tabs__group-header', { hasText: `${translation.inProcess}` });
            const newChats = await inProcessHeader.locator('xpath=preceding-sibling::button');
            const inProcessChats = await inProcessHeader.locator('xpath=following-sibling::button');


            if (newChats.first()) {
                await newChats.first().click()
            }

            const takeOverButton = page.locator('.active-chat__toolbar').getByText(`${translation.takeOver}`, { exact: true });
            await expect(takeOverButton).toBeVisible();
            await takeOverButton.click()
            await page.waitForTimeout(2000);
            
            if (inProcessChats.first()) {
                await inProcessChats.first().click()
            }

            const chatMeta = page.locator('.active-chat__side-meta');
            const chatId = await chatMeta
                .locator(`p:has(strong:has-text("${translation.id}"))`)
                .locator('xpath=following-sibling::p')
                .innerText();

            const contactedUserButton = page.locator('.active-chat__toolbar').getByText(`${translation.contactedUser}`, { exact: true });
            await expect(contactedUserButton).toBeVisible();
            await contactedUserButton.click()
            await page.waitForTimeout(3000);

            await page.goto('https://admin.prod.buerokratt.ee/chat/history');
            await page.waitForTimeout(2000);
            
            const searchInput = await page.getByPlaceholder(`${translation.searchChats}`, { exact: true });
            await searchInput.fill(chatId);
            await page.waitForTimeout(1000);

            const rows = page.locator('table tbody tr');
            expect(await rows.count()).toBe(1);

            const idRowCell = rows.first().locator('td').nth(10);
            const idRowCellText = await idRowCell.textContent();
            expect(chatId).toContain(idRowCellText);


        });
    });

});