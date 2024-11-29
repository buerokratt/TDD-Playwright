// File path: tests/chat-active-functionality.spec.js
import { test, expect } from '@playwright/test';
import { getTranslations } from '@translation/languageDetector.js';
import {
    turnSwitchOn,
    provideData,
    takeOverFirstChat
} from 'tests/admin/landingPage/mainPage/sideBar/conversations/unanswered/helper.js';

let translation;

test.describe('Buerokratt-Chatbot Functionality Tests', () => {
    test.beforeEach(async ({ page }) => {
        test.info().annotations.push({ type: 'repository', description: 'Buerokratt-Chatbot' });
        test.setTimeout(1800000);
        await page.goto('https://admin.prod.buerokratt.ee/chat/unanswered');
        await turnSwitchOn(page);
        await provideData();
        await takeOverFirstChat(page);
        await page.goto('https://admin.prod.buerokratt.ee/chat/active');
        translation = await getTranslations(page);
        const firstTabButton = await page.getByRole('tab').first();
        await firstTabButton.click();
    });

    test('Check End Chat Button and Dialog Functionality', async ({ page }) => {
        const endChatButton = page.getByText(`${translation.endChat}`, { exact: true });
        await expect(endChatButton).toBeVisible();
        await endChatButton.click();

        const dialog = page.getByRole('dialog');
        const dialogHeader = dialog.getByRole('heading', { name: `${translation.chooseChatStatus}`, exact: true });
        await expect(dialogHeader).toBeVisible();

        const options = [
            `${translation.acceptedResponse}`,
            `${translation.hateSpeech}`,
            `${translation.otherReasons}`,
            `${translation.responseWasSentToClientEmail}`
        ];

        for (const option of options) {
            const optionRadio = dialog.getByText(option, { exact: true });
            await expect(optionRadio).toBeVisible();
        }

        await dialog.getByText(`${translation.acceptedResponse}`, { exact: true }).click();

        const endChatDialogButton = dialog.getByText(`${translation.endChat}`, { exact: true });
        await expect(endChatDialogButton).toBeVisible();
        await endChatDialogButton.click();
    });

    test('Forward to Colleague Functionality', async ({ page }) => {
        const forwardButton = page.getByText(`${translation.forwardToColleague}`, { exact: true });
        await expect(forwardButton).toBeVisible();
        await forwardButton.click();

        const dialogHeader = page.getByRole('heading', { name: `${translation.whoToForwardTheChat}`, exact: true });
        await expect(dialogHeader).toBeVisible();

        const searchInput = page.getByPlaceholder(`${translation.searchByName}`);
        await expect(searchInput).toBeVisible();

        const tableHeaders = page.getByRole('table').locator('thead');
        const headerKeys = [`${translation.name}`, `${translation.displayName}`, `${translation.status}`];

        for (const header of headerKeys) {
            await expect(tableHeaders.getByText(header, { exact: true })).toBeVisible();
        }

        const firstRow = page.getByRole('table').locator('tbody').locator('tr').first();
        const forwardChatButton = firstRow.getByRole('button', { name: `${translation.forward}`, exact: true });
        await expect(forwardChatButton).toBeVisible();
        await forwardChatButton.click();
    });

    test('Check Active Chat Metadata Visibility', async ({ page }) => {
        const sideMeta = page.locator('.active-chat__side-meta');
        const metaParagraphs = [
            `${translation.id}`,
            `${translation.endUserName}`,
            `${translation.clientSupportName}`,
            `${translation.chatStartedAt}`,
            `${translation.device}`,
            `${translation.location}`
        ];

        for (const meta of metaParagraphs) {
            await expect(sideMeta.getByText(meta, { exact: true })).toBeVisible();
        }
    });

    test('Reply Functionality in Active Chat Toolbar', async ({ page }) => {
        const replyTextarea = page.getByPlaceholder(`${translation.reply}`);
        const toolbarActions = page.locator('.active-chat__toolbar-actions');
        await expect(replyTextarea).toBeVisible();
        await expect(toolbarActions).toBeVisible();

        const replyText = 'Testing reply functionality';
        await replyTextarea.fill(replyText);
        await toolbarActions.getByRole('button').click();

        // Verify that the reply has been sent
        const lastMessage = page.locator('.active-chat__message-text').last();
        await expect(lastMessage).toHaveText(replyText, { timeout: 5000 });
    });

    test('Pagination Handling in Forward to Colleague Dialog', async ({ page }) => {
        const forwardButton = page.getByText(`${translation.forwardToColleague}`, { exact: true });
        await expect(forwardButton).toBeVisible();
        await forwardButton.click();

        const paginationLabel = page.getByText(`${translation.resultCount}`, { exact: true });
        const paginationDropdown = page.getByRole('combobox', { name: `${translation.resultCount}` });

        await expect(paginationLabel).toBeVisible();
        await expect(paginationDropdown).toBeVisible();

        await paginationDropdown.selectOption('20');
        await page.waitForTimeout(3000); // Ensure the results refresh
    });
});
