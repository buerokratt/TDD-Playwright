import { test, expect } from '@playwright/test';
import { getTranslations } from '@translation/languageDetector.js';
import {
    turnSwitchOn,
    changeOpenHoursTo24and7,
    provideData,
    selectFirstItem,
} from '../../unanswered/helper.js';

let translation;

test.describe('Unanswered Chats Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('https://admin.prod.buerokratt.ee/chat/unanswered');
        await page.waitForTimeout(3000);
        translation = await getTranslations(page);
        test.info().annotations.push({ type: 'repository', description: 'Unanswered Chats Testing' });
        await turnSwitchOn(page);
        await changeOpenHoursTo24and7();
        await provideData();
        await selectFirstItem(page);
    });



    test('Validate Unanswered Chats Header and Count', async ({ page }) => {
        const header = await page.locator('.vertical-tabs__group-header');
        await expect(header).toHaveText(new RegExp(translation.unansweredConversations));
    });

    test('Validate Active Chat Section Elements', async ({ page }) => {
        const chatWrapper = await page.locator('.active-chat__group-wrapper');
        const toolbar = await page.locator('.active-chat__toolbar');
        const sideActions = await page.locator('.active-chat__side-actions');
        const meta = await page.locator('.active-chat__side-meta');
        await expect(chatWrapper).toBeVisible();
        await expect(toolbar).toBeVisible();
        await expect(sideActions).toBeVisible();
        await expect(meta).toBeVisible();
    });

    test('Validate "End Chat" Button Visibility and Actions', async ({ page }) => {
        const endChatButton = await page.locator('.active-chat__side-actions').getByRole('button', { name: `${translation.endChat}`, exact: true });
        await expect(endChatButton).toBeVisible();
        await endChatButton.click();

        const dialogHeader = await page.locator('.dialog__header').getByRole('heading', { name: `${translation.chooseChatStatus}`, exact: true });
        await expect(dialogHeader).toBeVisible();
    });

    test('Validate "Forward to Colleague" Dialog and Table', async ({ page }) => {
        const forwardButton = await page.locator('.active-chat__side-actions').getByRole('button', { name: `${translation.forwardToColleague}`, exact: true });
        await expect(forwardButton).toBeVisible();
        await forwardButton.click();

        const dialogHeader = await page.locator('.dialog__header').getByRole('heading', { name: `${translation.whoToForwardTheChat}`, exact: true });
        const searchInput = await page.locator('.dialog__body').getByPlaceholder(`${translation.searchByName}`);
        const activeAgentsCheckbox = await page.locator('.dialog__body').getByRole('checkbox', { name: `${translation.showOnlyActiveClientSupportAgents}`, exact: true });

        await expect(dialogHeader).toBeVisible();
        await expect(searchInput).toBeVisible();
        await expect(activeAgentsCheckbox).toBeVisible();

        const table = page.locator('.dialog__body table');



        const tableHeaders = [`${translation.name}`, `${translation.displayName}`, `${translation.status}`];
        for (const header of tableHeaders) {
            const headerLocator = await table.getByText(header, { exact: true });
            await expect(headerLocator).toBeVisible();
        }

        const firstRowForwardButton = table.locator('tbody').getByRole('row').nth(0).getByRole('button', { name: `${translation.forward}`, exact: true });
        await expect(firstRowForwardButton).toBeVisible();
    });

    test('Validate Side Actions Buttons State', async ({ page }) => {
        const sideActions = page.locator('.active-chat__side-actions');
        const endChatButton = sideActions.getByRole('button', { name: `${translation.endChat}`, exact: true });
        const askAuthButton = sideActions.getByRole('button', { name: `${translation.askForAuthentication}`, exact: true });
        const forwardButton = sideActions.getByRole('button', { name: `${translation.forwardToColleague}`, exact: true });

        await expect(endChatButton).toBeVisible();
        await expect(askAuthButton).toBeDisabled();
        await expect(forwardButton).toBeVisible();
    });

    test.only('Validate Chat Metadata', async ({ page }) => {
        const meta = page.locator('.active-chat__side-meta');
        const id = meta.getByText(`${translation.id}`);
        const endUserName = meta.getByText(`${translation.endUserName}`);
        const device = meta.getByText(`${translation.device}`);
        const location = meta.getByText(`${translation.location}`);

        await expect(id).toBeVisible();
        await expect(endUserName).toBeVisible();
        await expect(device).toBeVisible();
        await expect(location).toBeVisible();
    });
});
