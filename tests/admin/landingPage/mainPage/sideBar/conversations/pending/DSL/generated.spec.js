import { test, expect } from '@playwright/test';
import { getTranslations } from '@translation/languageDetector.js';
import {
    turnSwitchOn,
    changeOpenHoursToClosed,
    letQuestion,
    selectFirstItem
} from '../../unanswered/helper';

let translation;

test.describe('Buerokratt-Chatbot', () => {

    test.beforeEach(async ({ page }) => {
        test.info().annotations.push({ type: 'repository', description: 'Buerokratt-Chatbot' });
        await changeOpenHoursToClosed();
        await letQuestion(page);
        await page.goto('https://admin.prod.buerokratt.ee/chat/pending');
        await page.waitForTimeout(4000);
        await turnSwitchOn(page);
        await selectFirstItem(page);
        translation = await getTranslations(page);
    });

    test.describe('Vertical Tabs', () => {
        test('should display header1', async ({ page }) => {
            const newHeader = page.locator('.vertical-tabs__group-header');
            await expect(newHeader.getByText(new RegExp(`${translation.new}`))).toBeVisible();
        });

        test('should display header2', async ({ page }) => {
            const inProccessHeader = page.locator('.vertical-tabs__group-header');
            await expect(inProccessHeader.getByText(new RegExp(`${translation.inProcess}`))).toBeVisible();
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

        test('should have chat wrapper', async ({ page }) => {
            const wrapper = page.locator('div.active-chat__group-wrapper');
            await expect(wrapper).toBeVisible();
        })
    });


    test.describe('Chat Metadata', () => {
        test('should display metadata fields correctly', async ({ page }) => {
            const chatMeta = page.locator('.active-chat__side-meta');
            await expect(chatMeta.getByText(`${translation.id}`, { exact: true })).toBeVisible();
            await expect(chatMeta.getByText(`${translation.endUserName}`, { exact: true })).toBeVisible();
            await expect(chatMeta.getByText(`${translation.endUserEmail}`, { exact: true })).toBeVisible();
            await expect(chatMeta.getByText(`${translation.endUserPhone}`, { exact: true })).toBeVisible();
            await expect(chatMeta.getByText(`${translation.clientSupportName}`, { exact: true })).toBeVisible();
            await expect(chatMeta.getByText(`${translation.chatStartedAt}`, { exact: true })).toBeVisible();
            await expect(chatMeta.getByText(`${translation.device}`, { exact: true })).toBeVisible();
            await expect(chatMeta.getByText(`${translation.location}`, { exact: true })).toBeVisible();
        });
    });



    


});
