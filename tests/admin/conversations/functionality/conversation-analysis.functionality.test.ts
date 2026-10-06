import { expect, test } from '@setup/test-setup';
import { ACTION_TIMEOUT, CHAT_ANALYSIS_LABEL_SECTIONS } from '@utils/constants';
import { URLS } from '@utils/env';
import {
  chatAnalysisConfigRestore,
  conversationAnalysisCleanup,
  readChatAnalysisConfig,
  readUserDisplayName,
} from '@utils/helpers';
import { AnalysedConversation, ChatAnalysisDomainSnapshot, ConversationAnalysis } from '@utils/interfaces';
import { createChatAnalysisLabel } from '@utils/test-data';

const [themeSection, qualitySection, followUpSection] = CHAT_ANALYSIS_LABEL_SECTIONS;

const analysis: ConversationAnalysis = {
  theme: createChatAnalysisLabel('autotesttheme'),
  responseQuality: createChatAnalysisLabel('autotestquality'),
  followUpAction: createChatAnalysisLabel('autotestfollowup'),
};

test.describe('[conversations] [functional] A conversation is analysed from the conversation drawer', () => {
  let analysed: AnalysedConversation | undefined;
  let settingsBefore: ChatAnalysisDomainSnapshot | undefined;

  test.afterEach(async ({ page, historyPage }) => {
    await conversationAnalysisCleanup(() => analysed)({ historyPage });
    await chatAnalysisConfigRestore(() => settingsBefore)({ page });
  });

  test(
    'The values picked are confirmed, kept on the card and carried into the conversations table',
    { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/195/' } },
    async ({ page, chatAnalysisPage, historyPage }) => {
      await test.step('The domain the conversations belong to has a label in every section', async () => {
        await chatAnalysisPage.open();

        const domainId = await chatAnalysisPage.selectDomainTab();

        settingsBefore = { domainId, config: await readChatAnalysisConfig(page, domainId) };

        await chatAnalysisPage.enableAnalysis();

        await chatAnalysisPage.addLabel(themeSection.title, analysis.theme);
        await chatAnalysisPage.addLabel(qualitySection.title, analysis.responseQuality);
        await chatAnalysisPage.addLabel(followUpSection.title, analysis.followUpAction);

        await chatAnalysisPage.saveSettings();
        await chatAnalysisPage.assertSaveWasConfirmed();
      });

      await historyPage.open();

      const conversationId = await historyPage.findConversationIdByWebpage(URLS.customer);

      await test.step(`Conversation "${conversationId}" opens in the drawer`, async () => {
        await historyPage.assertPageIsShown();
        await historyPage.openConversationDetails(conversationId);
      });

      await test.step('Each value picked in the analysis panel is reported as saved', async () => {
        await historyPage.selectTheme(analysis.theme);
        await historyPage.assertThemeWasSaved();
        analysed = { conversationId, analysis };

        await historyPage.selectResponseQuality(analysis.responseQuality);
        await historyPage.assertResponseQualityWasSaved();

        await historyPage.selectFollowUpAction(analysis.followUpAction);
        await historyPage.assertFollowUpActionWasSaved();
      });

      await test.step('The pickers show the picked values right away', async () => {
        expect(await historyPage.readAnalysisSelections(), 'The pickers did not show what was just picked').toEqual(
          analysis,
        );
      });

      await test.step('The conversation drawer retains the selected values', async () => {
        await historyPage.open();
        await historyPage.openConversationDetails(conversationId);

        await expect
          .poll(() => historyPage.readAnalysisSelections(), {
            message: 'The conversation drawer lost the selected values',
            timeout: ACTION_TIMEOUT,
          })
          .toEqual(analysis);
      });

      await test.step('The conversation drawer records who analysed the conversation and when', async () => {
        const author = await readUserDisplayName(page);

        await historyPage.assertAnalysisWasRecorded('Chat theme', analysis.theme, author);
        await historyPage.assertAnalysisWasRecorded('Chat response quality', analysis.responseQuality, author);
        await historyPage.assertAnalysisWasRecorded('Follow-up action', analysis.followUpAction, author);
      });

      await test.step('The conversations table carries the values in the row of that conversation', async () => {
        await historyPage.closeConversation();

        await expect
          .poll(() => historyPage.readRowAnalysis(conversationId), {
            message: 'The conversation row was left without the values selected in the drawer',
            timeout: ACTION_TIMEOUT,
          })
          .toEqual(analysis);
      });
    },
  );
});
