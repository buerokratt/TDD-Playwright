import { Page, expect } from '@playwright/test';

import { AdminPageFactory } from '@page-objects/admin-page-factory';
import { USER_INFO_URL } from '@utils/constants';
import { AnalysedConversation } from '@utils/interfaces';

type AnalysedConversationResolver = () => AnalysedConversation | undefined;

export async function readUserDisplayName(page: Page): Promise<string> {
  const response = await page.request.get(USER_INFO_URL);

  expect(response.ok(), `The back office would not report who is signed in (${response.status()})`).toBeTruthy();

  const { response: user } = (await response.json()) as { response: { displayName: string } };

  return user.displayName;
}

export function conversationAnalysisCleanup(resolveAnalysed: AnalysedConversationResolver) {
  return async ({ page }: { page: Page }): Promise<void> => {
    const analysed = resolveAnalysed();

    if (!analysed) {
      return;
    }

    const history = new AdminPageFactory(page).getHistoryPage();

    await history.open();
    await history.openConversation(analysed.conversationId);
    await history.clearAnalysisSelections(analysed.analysis);
  };
}
