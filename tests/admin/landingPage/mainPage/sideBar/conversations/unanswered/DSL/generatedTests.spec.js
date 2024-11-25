import { test, expect } from '@playwright/test';
import { getTranslations } from '@translation/languageDetector.js';
import {
    turnSwitchOn,
    changeOpenHoursTo24and7,
    provideData,
    selectFirstItem
} from '../helper';

let translation;

test.describe('Buerokratt-Chatbot Functionality Testing', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('https://admin.prod.buerokratt.ee/chat/unanswered');
        translation = await getTranslations(page);
        test.info().annotations.push({ type: 'repository', description: 'Buerokratt-Chatbot' });
        await page.waitForTimeout(3000);

        await turnSwitchOn(page);
        await changeOpenHoursTo24and7();
        await provideData();
        await selectFirstItem(page);
    });

    test('should display unanswered chats header with dynamic count', async ({ page }) => {
        const header = page.locator('.vertical-tabs__group-header');
        await expect(header).toHaveText(new RegExp(`${translation.unansweredChats}`));
    });

    test('should display and interact with chat management actions', async ({ page }) => {
        const toolbar = page.locator('.active-chat__toolbar');
        const takeOverButton = toolbar.getByRole('button', { name: `${translation.takeOver}`, exact: true });
        await expect(takeOverButton).toBeVisible();
        await takeOverButton.click();

        const sideActions = page.locator('.active-chat__side-actions');
        const endChatButton = sideActions.getByRole('button', { name: `${translation.endChat}`, exact: true });
        const forwardToColleagueButton = sideActions.getByRole('button', { name: `${translation.forwardToColleague}`, exact: true });

        await expect(endChatButton).toBeVisible();
        await expect(forwardToColleagueButton).toBeVisible();

        await endChatButton.click();
        const endChatDialog = page.locator('.dialog__header');
        await expect(endChatDialog).toContainText(`${translation.chooseChatStatus}`);

        const cancelButton = page.locator('.dialog__footer').getByRole('button', { name: `${translation.cancel}`, exact: true });
        const confirmEndChatButton = page.locator('.dialog__footer').getByRole('button', { name: `${translation.endChat}`, exact: true });

        await expect(cancelButton).toBeVisible();
        await expect(confirmEndChatButton).toBeVisible();
    });

    test('should handle forward to colleague functionality', async ({ page }) => {
        const p = page.locator('header .track p');
        const firstStrong1 = p.locator('strong').first();

        const forwardChat1 = page.getByText(`${translation.forwardToColleague}`)
        await forwardChat1.click();

        const forwardButton = page.getByRole('button', { name: `${translation.forward}`, exact: true }).first();

        await forwardButton.click();

        const firstStrong2 = p.locator('strong').first();

        await expect(firstStrong1).not.toBe(firstStrong2);

    });

    test('should validate table sorting and searching functionality', async ({ page }) => {
        const forwardChat = page.getByText(`${translation.forwardToColleague}`)
        await forwardChat.click();
        
        const tableHeaders = page.locator('table thead tr th');
        await expect(tableHeaders).toHaveCount(4);
        const rows = page.locator('table tbody tr');

        const headerCount = await tableHeaders.count();
        for (let i = 0; i < headerCount-1; i++) {
            const header = tableHeaders.nth(i);
            const button = header.locator('button').first();
            await button.click();
            await page.waitForTimeout(1000);

            const ascendingOrder = await getColumnValues(rows, i);
            const sortedAscending = [...ascendingOrder].sort((a, b) => a.localeCompare(b));
            await expect(ascendingOrder).toEqual(sortedAscending);

            await button.click();
            await page.waitForTimeout(1000);

            const descendingOrder = await getColumnValues(rows, i);
            const sortedDescending = [...descendingOrder].sort((a, b) => b.localeCompare(a));
            await expect(descendingOrder).toEqual(sortedDescending);
        }

        async function getColumnValues(rows, columnIndex) {
            const values = [];
            for (let i = 0; i < await rows.count(); i++) {
                const row = rows.nth(i);
                const cell = row.locator('td').nth(columnIndex);
                values.push((await cell.innerText()).trim());
            }
            return values;
        }
    });

    test('should validate search functionality in table', async ({ page }) => {
        const forwardChat = page.getByText(`${translation.forwardToColleague}`);
        await forwardChat.click();

        const rows = page.locator('table tbody tr');
        const headers = ['Name', 'Display name', 'Status'];

        for (let i = 0; i < headers.length; i++) {

            const searchInput = page.getByPlaceholder(`${translation.searchByName}`);
            const firstRowValue = (await rows.first().locator('td').nth(0).innerText()).trim();

            await searchInput.fill(firstRowValue);
            await page.waitForTimeout(1000);

            const filteredRowValue = (await rows.first().locator('td').nth(0).innerText()).trim();
            await expect(filteredRowValue).toBe(firstRowValue);
            await expect(await rows.count()).toBe(1)

            await searchInput.fill('');
            await page.waitForTimeout(1000);
        }
    });

});
