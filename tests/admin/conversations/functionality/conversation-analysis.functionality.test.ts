import { AdminPageFactory } from '@page-objects/admin-page-factory';
import { expect, test } from '@setup/test-setup';
import { ACTION_TIMEOUT, CHAT_ANALYSIS_LABEL_SECTIONS } from '@utils/constants';
import { URLS } from '@utils/env';
import { chatAnalysisCleanup, conversationAnalysisCleanup, readUserDisplayName } from '@utils/helpers';
import { AnalysedConversation, ConversationAnalysis } from '@utils/interfaces';
import { createChatAnalysisLabel } from '@utils/test-data';

const [themeSection, qualitySection, followUpSection] = CHAT_ANALYSIS_LABEL_SECTIONS;

const analysis: ConversationAnalysis = {
  theme: createChatAnalysisLabel('autotesttheme'),
  responseQuality: createChatAnalysisLabel('autotestquality'),
  followUpAction: createChatAnalysisLabel('autotestfollowup'),
};

test.describe('[conversations] [functional] A conversation is analysed from its own card', () => {
  let analysed: AnalysedConversation | undefined;

  test.afterEach(conversationAnalysisCleanup(() => analysed));
  test.afterEach(chatAnalysisCleanup(() => [analysis.theme, analysis.responseQuality, analysis.followUpAction]));

  test(
    'The values picked are confirmed, kept on the card and carried into the conversations table',
    { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/195/' } },
    async ({ page }) => {
      const admin = new AdminPageFactory(page);
      const cap = admin.getChatAnalysisPage();
      const history = admin.getHistoryPage();

      await test.step('The domain the conversations belong to has a label in every section', async () => {
        await cap.open();
        await cap.selectDomainTab();
        await cap.enableAnalysis();

        await cap.addLabel(themeSection.title, analysis.theme);
        await cap.addLabel(qualitySection.title, analysis.responseQuality);
        await cap.addLabel(followUpSection.title, analysis.followUpAction);

        await cap.saveSettings();
        await cap.assertSaveWasConfirmed();
      });

      await history.open();

      const conversationId = await history.findConversationIdByWebpage(URLS.customer);

      await test.step(`Conversation "${conversationId}" opens on its own card`, async () => {
        await history.assertPageIsShown();
        await history.openConversation(conversationId);
      });

      await test.step('Each value picked in the analysis panel is reported as saved', async () => {
        await history.selectTheme(analysis.theme);
        await history.assertThemeWasSaved();
        analysed = { conversationId, analysis };

        await history.selectResponseQuality(analysis.responseQuality);
        await history.assertResponseQualityWasSaved();

        await history.selectFollowUpAction(analysis.followUpAction);
        await history.assertFollowUpActionWasSaved();
      });

      await test.step('The card comes back holding the values in its pickers', async () => {
        await history.open();
        await history.openConversation(conversationId);

        await expect
          .poll(() => history.readAnalysisSelections(), {
            message: 'The card lost what was picked on it',
            timeout: ACTION_TIMEOUT,
          })
          .toEqual(analysis);
      });

      await test.step('The card records who analysed the conversation and when', async () => {
        const author = await readUserDisplayName(page);

        await history.assertAnalysisWasRecorded('Chat theme', analysis.theme, author);
        await history.assertAnalysisWasRecorded('Chat response quality', analysis.responseQuality, author);
        await history.assertAnalysisWasRecorded('Follow-up action', analysis.followUpAction, author);
      });

      await test.step('The conversations table carries the values in the row of that conversation', async () => {
        await history.closeConversation();

        await expect
          .poll(() => history.readRowAnalysis(conversationId), {
            message: 'The conversation row was left without what the card holds',
            timeout: ACTION_TIMEOUT,
          })
          .toEqual(analysis);
      });
    },
  );
});
