import { test, expect } from '@playwright/test';
import { getTranslations } from '@translation/languageDetector.js';
import { turnSwitchOn, provideData, takeOverFirstChat } from '../unanswered/helper';

let translation;

test.describe('Active Chats', () => {
  
  test.beforeEach(async ({ page }) => {
    test.info().annotations.push({ type: 'repository', description: 'Active chats' });
    await page.goto('https://admin.prod.buerokratt.ee/chat/active');
    await page.waitForTimeout(3000); // Ensure all elements load properly
    translation = await getTranslations(page);
  });

  test('Vertical Tabs - My Chats', async ({ page }) => {
    const groupHeader = await page.locator('.verticalTabs__groupHeader', { exact: true });
    await expect(groupHeader).toBeVisible();

    const myChatsText = await page.getByText(`${translation.myChats}`, { exact: true });
    await expect(myChatsText).toBeVisible();

    const chooseChatText = await page.getByText(`${translation.chooseChat}`, { exact: true });
    await expect(chooseChatText).toBeVisible();
  });

  test.describe('Selected Chat - Header', () => {
    test('Check Header', async ({ page }) => {
      const headerParagraph = await page.getByText(`${translation.headerParagraph}`, { exact: true });
      await expect(headerParagraph).toBeVisible();

      const headerTitle = await page.getByRole('heading', { name: `${translation.headerTitle}`, exact: true });
      await expect(headerTitle).toBeVisible();
    });
  });

  test.describe('Selected Chat - Side Meta Information', () => {
    test('Check Meta Information', async ({ page }) => {
      const idText = await page.getByText(`${translation.id}`, { exact: true });
      await expect(idText).toBeVisible();

      const endUserNameText = await page.getByText(`${translation.endUserName}`, { exact: true });
      await expect(endUserNameText).toBeVisible();

      const clientSupportNameText = await page.getByText(`${translation.clientSupportName}`, { exact: true });
      await expect(clientSupportNameText).toBeVisible();

      const chatStartedAtText = await page.getByText(`${translation.chatStartedAt}`, { exact: true });
      await expect(chatStartedAtText).toBeVisible();

      const deviceText = await page.getByText(`${translation.device}`, { exact: true });
      await expect(deviceText).toBeVisible();

      const locationText = await page.getByText(`${translation.location}`, { exact: true });
      await expect(locationText).toBeVisible();
    });
  });
});
