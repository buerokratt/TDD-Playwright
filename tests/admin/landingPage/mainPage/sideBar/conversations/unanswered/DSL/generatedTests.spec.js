import { test, expect } from '@playwright/test';
import { getTranslations } from '@translation/languageDetector.js';
import {
    turnSwitchOn,
    changeOpenHoursTo24and7,
    provideData,
    selectFirstItem
} from '../helper';

let translation;

test.describe('Buerokratt-Chatbot', () => {

    test.beforeEach(async ({ page }) => {
        test.info().annotations.push({ type: 'repository', description: 'Buerokratt-Chatbot' });
        await page.goto('https://admin.prod.buerokratt.ee/chat/unanswered');
        await page.waitForTimeout(3000);
        await turnSwitchOn(page);
        await changeOpenHoursTo24and7();
        await provideData();
        await selectFirstItem(page);
        translation = await getTranslations(page);
    });

    test.describe('Vertical Tabs', () => {
        test('should display unanswered chats count in group header', async ({ page }) => {
            const unansweredHeader = page.locator('.vertical-tabs__group-header');
            await expect(unansweredHeader.getByText(new RegExp(`${translation.unansweredChats}`))).toBeVisible();
        });
    });

    test.describe('Selected Chat Section', () => {
        test('should display anonymous user in active chat header', async ({ page }) => {
            const chatHeader = page.locator('.active-chat__header');
            await expect(chatHeader.getByRole('heading', { name: `${translation.anonymous}`, exact: true })).toBeVisible();
        });

        test('should display Take Over button in active chat toolbar', async ({ page }) => {
            const takeOverButton = page.locator('.active-chat__toolbar').getByText(`${translation.takeOver}`, { exact: true });
            await expect(takeOverButton).toBeVisible();
        });
    });

    test.describe('Side Actions', () => {
        test('should have End chat button enabled and other buttons disabled as specified', async ({ page }) => {
            const sideActions = page.locator('.active-chat__side-actions');
            await expect(sideActions.getByText(`${translation.endChat}`, { exact: true })).toBeVisible();
            await expect(sideActions.getByText(`${translation.askAuthentication}`, { exact: true })).toBeDisabled();
            await expect(sideActions.getByText(`${translation.askContactInformation}`, { exact: true })).toBeDisabled();
            await expect(sideActions.getByText(`${translation.askPermission}`, { exact: true })).toBeDisabled();
            await expect(sideActions.getByText(`${translation.forwardToColleague}`, { exact: true })).toBeVisible();
        });
    });

    test.describe('Chat Metadata', () => {
        test('should display metadata fields correctly', async ({ page }) => {
            const chatMeta = page.locator('.active-chat__side-meta');
            await expect(chatMeta.getByText(`${translation.id}`, { exact: true })).toBeVisible();
            await expect(chatMeta.getByText(`${translation.endUserName}`, { exact: true })).toBeVisible();
            await expect(chatMeta.getByText(`${translation.chatStartedAt}`, { exact: true })).toBeVisible();
            await expect(chatMeta.getByText(`${translation.device}`, { exact: true })).toBeVisible();
            await expect(chatMeta.getByText(`${translation.location}`, { exact: true })).toBeVisible();
        });
    });

    test.describe('End Chat Dialog', () => {
        test('should open dialog with chat status options after clicking End chat button', async ({ page }) => {
            await page.locator('.active-chat__side-actions').getByText(`${translation.endChat}`, { exact: true }).click();
            const dialogHeader = page.locator('.dialog__header').getByRole('heading', { level: 2, name: `${translation.chooseChatStatus}`, exact: true });
            await expect(dialogHeader).toBeVisible();

            const dialogBody = page.locator('.dialog__body');
            await expect(dialogBody.getByText(`${translation.acceptedResponse}`, { exact: true })).toBeVisible();
            await expect(dialogBody.getByText(`${translation.hateSpeech}`, { exact: true })).toBeVisible();
            await expect(dialogBody.getByText(`${translation.otherReasons}`, { exact: true })).toBeVisible();
            await expect(dialogBody.getByText(`${translation.responseWasSentToClientEmail}`, { exact: true })).toBeVisible();

            const dialogFooter = page.locator('.dialog__footer');
            await expect(dialogFooter.getByText(`${translation.cancel}`, { exact: true })).toBeVisible();
            await expect(dialogFooter.getByText(`${translation.endChat}`, { exact: true })).toBeVisible();
        });
    });


    test.describe('Forward to Colleague Dialog', () => {
        test('should open forward dialog with search and filtering options', async ({ page }) => {
            await page.locator('.active-chat__side-actions').getByText(`${translation.forwardToColleague}`, { exact: true }).click();
            const dialogHeader = page.locator('.dialog__header').getByRole('heading', { level: 2, name: `${translation.whoToForwardTheChat}`, exact: true });
            await expect(dialogHeader).toBeVisible();

            const searchInput = page.locator('.dialog__body').getByPlaceholder(`${translation.searchByName}`);
            await expect(searchInput).toBeVisible();

            const activeOnlyCheckbox = page.locator('.dialog__body').getByText(`${translation.showOnlyActiveClientSupportAgents}`, { exact: true });
            await expect(activeOnlyCheckbox).toBeVisible();
        });

        test('should display forward option for each agent in forward dialog', async ({ page }) => {
            await page.locator('.active-chat__side-actions').getByText(`${translation.forwardToColleague}`, { exact: true }).click();
            const dataRow = page.locator('.data-table');
            const forwardButton = dataRow.getByRole('button', { name: `${translation.forward}`, exact: true}).first();
            await expect(forwardButton).toBeVisible();
        });
    });

    test.describe('Pagination Controls', () => {
        test('should display pagination label and select for result count', async ({ page }) => {
            await page.locator('.active-chat__side-actions').getByText(`${translation.forwardToColleague}`, { exact: true }).click();

            const paginationLabel = await page.getByText(`${translation.resultCount}`, { exact: true });
            await expect(paginationLabel).toBeVisible();

            const paginationSelect = await page.getByRole('combobox', { name: `${translation.resultCount}` });
            await expect(paginationSelect).toBeVisible();
        });
    });
});
