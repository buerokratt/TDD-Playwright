import { test, expect } from '@playwright/test';
import { getTranslations } from '@translation/languageDetector.js';
import { turnSwitchOn, provideData, takeOverFirstChat } from '../../unanswered/helper';

let translation;

test.describe.skip('Buerokratt-Chatbot Active Chat. These tests are skipped due to issues with the chat takeover functionality. Specifically, the "takeover" action ' +
                'is not working as expected: it does not reliably redirect to the active chats page, and taken-over chats sometimes remain ' +
                'in the unanswered list. This causes inconsistencies and failures in tests that rely on the chat being moved to the active state.', () => {
   
    test.beforeEach(async ({ page }) => {
        test.info().annotations.push({ type: 'repository', description: 'Buerokratt-Chatbot' });
        
        await page.goto('https://admin.prod.buerokratt.ee/chat/unanswered');
        await page.waitForTimeout(2000);
        await turnSwitchOn(page);
        await provideData();
        await takeOverFirstChat(page);
        translation = await getTranslations(page);
    });

    test.describe('Vertical Tabs', () => {
        test('displays My Chats header with dynamic count', async ({ page }) => {
            const myChatsHeader = await page.locator('.vertical-tabs__group-header').getByText(new RegExp(translation.myChats));
            await expect(myChatsHeader).toBeVisible();
        });
    });

    test.describe('Selected Chat Area', () => {
        test('displays chat metadata and action buttons', async ({ page }) => {
            const chatId = await page.locator('.active-chat__side-meta').getByText(`${translation.id}`, { exact: true });
            const chatEndUserName = await page.locator('.active-chat__side-meta').getByText(`${translation.endUserName}`, { exact: true });
            const chatDevice = await page.locator('.active-chat__side-meta').getByText(`${translation.device}`, { exact: true });
            const chatLocation = await page.locator('.active-chat__side-meta').getByText(`${translation.location}`, { exact: true });

            await expect(chatId).toBeVisible();
            await expect(chatEndUserName).toBeVisible();
            await expect(chatDevice).toBeVisible();
            await expect(chatLocation).toBeVisible();
        });

        test('displays and enables side actions buttons', async ({ page }) => {
            const endChatButton = await page.locator('.active-chat__side-actions').getByText(`${translation.endChat}`, { exact: true });
            const askAuthButton = await page.locator('.active-chat__side-actions').getByText(`${translation.askForAuthentication}`, { exact: true });
            const forwardButton = await page.locator('.active-chat__side-actions').getByText(`${translation.forwardToColleague}`, { exact: true });

            await expect(endChatButton).toBeVisible();
            await expect(endChatButton).toBeEnabled();
            await expect(askAuthButton).toBeVisible();
            await expect(askAuthButton).toBeEnabled();
            await expect(forwardButton).toBeVisible();
            await expect(forwardButton).toBeEnabled();
        });

        test('opens end chat dialog on clicking "End chat"', async ({ page }) => {
            const endChatButton = await page.locator('.active-chat__side-actions').getByText(`${translation.endChat}`, { exact: true });
            await endChatButton.click();
            const endChatDialog = await page.locator('.dialog__header').getByRole('heading', { name: `${translation.chooseChatStatus}`, exact: true });
            await expect(endChatDialog).toBeVisible();
        });

        test('opens forward to colleague dialog on clicking "Forward to Colleague"', async ({ page }) => {
            const forwardButton = await page.locator('.active-chat__side-actions').getByText(`${translation.forwardToColleague}`, { exact: true });
            await forwardButton.click();
            const forwardDialog = await page.locator('.dialog__header').getByRole('heading', { name: `${translation.whoToForwardTheChat}`, exact: true });
            await expect(forwardDialog).toBeVisible();
        });
    });

    test.describe('Forward to Colleague Dialog', () => {
        test('displays name, display name, and status headers', async ({ page }) => {
            const headers = [`${translation.name}`, `${translation.displayName}`, `${translation.status}`];
            for (const header of headers) {
                const sortingButton = page.locator('th').filter({ hasText: header }).locator('button');
                await expect(sortingButton).toBeVisible();
            }
        });

        test('displays a checkbox to show only active agents', async ({ page }) => {
            const onlyActiveAgentsCheckbox = page.locator('.dialog__body').getByText(`${translation.showOnlyActiveAgents}`, { exact: true });
            await expect(onlyActiveAgentsCheckbox).toBeVisible();
        });
    });
});
