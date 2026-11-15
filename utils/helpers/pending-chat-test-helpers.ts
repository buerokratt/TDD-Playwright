import { Page, expect } from '@playwright/test';

import { CHAT_END_URL } from '@utils/constants';

type ChatIdResolver = () => string | undefined;

export function pendingChatCleanup(resolveChatId: ChatIdResolver) {
  return async ({ page }: { page: Page }): Promise<void> => {
    const chatId = resolveChatId();

    if (!chatId) {
      return;
    }

    const response = await page.request.post(CHAT_END_URL, {
      data: { chatId, event: 'OTHER', authorTimestamp: new Date().toISOString() },
    });

    expect(
      response.ok(),
      `The back office failed to end the chat this run left pending (${response.status()})`,
    ).toBeTruthy();
  };
}
