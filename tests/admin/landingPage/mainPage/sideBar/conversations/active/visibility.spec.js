import { test, expect } from '@playwright/test';
import { getTranslations } from '@translation/languageDetector.js';
import {
  turnSwitchOn,
  provideData,
  takeOverFirstChat
} from 'tests/admin/landingPage/mainPage/sideBar/conversations/unanswered/helper.js';

let translation;

test.describe('Buerokratt-Chatbot Active Chats', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://admin.prod.buerokratt.ee/chat/unanswered');
    await turnSwitchOn(page);
    await provideData();
    await takeOverFirstChat(page);
    await page.goto('https://admin.prod.buerokratt.ee/chat/active');
    translation = await getTranslations(page);
    const button = await page.getByRole('tab').first();
    await button.click();
  });

  test('Check active chat side actions', async ({ page }) => {
    const endChatButton = await page.getByText(`${translation.endChat}`, { exact: true });
    const askAuthButton = await page.getByText(`${translation.askForAuthentication}`, { exact: true });
    const askContactButton = await page.getByText(`${translation.askForContact}`, { exact: true });
    const askPermissionButton = await page.getByText(`${translation.askPermission}`, { exact: true });
    const forwardToColleagueButton = await page.getByText(`${translation.forwardToColleague}`, { exact: true });

    await expect(endChatButton).toBeVisible();
    await expect(endChatButton).toBeEnabled();

    await expect(askAuthButton).toBeVisible();
    await expect(askAuthButton).toBeEnabled();

    await expect(askContactButton).toBeVisible();
    await expect(askContactButton).toBeEnabled();

    await expect(askPermissionButton).toBeVisible();
    await expect(askPermissionButton).toBeEnabled();

    await expect(forwardToColleagueButton).toBeVisible();
    await expect(forwardToColleagueButton).toBeEnabled();
  });

  test('Open and verify end chat dialog', async ({ page }) => {
    const endChatButton = await page.getByText(`${translation.endChat}`, { exact: true });
    await endChatButton.click();

    const dialog = page.getByRole('dialog');
    const dialogHeader = dialog.getByRole('heading', {
      name: `${translation.chooseChatStatus}`
    });

    await expect(dialogHeader).toBeVisible();

    const acceptedResponseRadio = dialog.getByText(`${translation.acceptedResponse}`);
    const hateSpeechRadio = dialog.getByText(`${translation.hateSpeech}`);
    const otherReasonsRadio = dialog.getByText(`${translation.otherReasons}`);
    const responseSentRadio = dialog.getByText(`${translation.responseWasSentToClientEmail}`);

    await expect(acceptedResponseRadio).toBeVisible();
    await expect(hateSpeechRadio).toBeVisible();
    await expect(otherReasonsRadio).toBeVisible();
    await expect(responseSentRadio).toBeVisible();
  });

  test('Open and verify forward to colleague dialog', async ({ page }) => {
    const forwardButton = await page.getByText(`${translation.forwardToColleague}`, { exact: true });
    await forwardButton.click();

    const dialog = page.getByRole('dialog');
    const dialogHeader = dialog.getByRole('heading', {
      name: `${translation.whoToForwardTheChat}`
    });

    await expect(dialogHeader).toBeVisible();

    const searchInput = dialog.getByPlaceholder(`${translation.searchByName}`, { exact: true });
    const activeAgentsCheckbox = dialog.getByLabel(`${translation.showOnlyActiveClientSupportAgents}`, { exact: true });

    await expect(searchInput).toBeVisible();
    await expect(activeAgentsCheckbox).toBeVisible();
  });

  test('Verify active chat metadata', async ({ page }) => {
    const idText = await page.getByText(`${translation.id}`, { exact: true });
    const endUserNameText = await page.getByText(`${translation.endUserName}`, { exact: true });
    const clientSupportNameText = await page.getByText(`${translation.clientSupportName}`, { exact: true });
    const chatStartedAtText = await page.getByText(`${translation.chatStartedAt}`, { exact: true });
    const deviceText = await page.getByText(`${translation.device}`, { exact: true });
    const locationText = await page.getByText(`${translation.location}`, { exact: true });

    await expect(idText).toBeVisible();
    await expect(endUserNameText).toBeVisible();
    await expect(clientSupportNameText).toBeVisible();
    await expect(chatStartedAtText).toBeVisible();
    await expect(deviceText).toBeVisible();
    await expect(locationText).toBeVisible();
  });
});
