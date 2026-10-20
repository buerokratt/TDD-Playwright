import { test } from '@setup/test-setup';
import { CHAT_ANALYSIS_LABEL_SECTIONS } from '@utils/constants';
import { createChatAnalysisLabel } from '@utils/test-data';

test.describe('[administration] [visibility] The chat analysis page shows its domains, its switch and its label sections', () => {
  test(
    'The page opens with every control the analysis is configured through',
    { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/158/' } },
    async ({ chatAnalysisPage }) => {
      await chatAnalysisPage.open();

      await test.step('The heading and the save control are on the page', async () => {
        await chatAnalysisPage.assertPageIsShown();
      });

      await test.step('The configured domains are offered as tabs with one of them selected', async () => {
        await chatAnalysisPage.assertDomainTabsAreShown();
      });

      await test.step('The settings of the selected domain can be copied to another domain', async () => {
        await chatAnalysisPage.assertCopyToDomainIsOffered();
      });

      await test.step('Chat analysis can be turned on and off from a switch of its own', async () => {
        await chatAnalysisPage.assertAnalysisSwitchIsShown();
        await chatAnalysisPage.enableAnalysis();
      });

      for (const section of CHAT_ANALYSIS_LABEL_SECTIONS) {
        await test.step(`"${section.title}" section offers its input field, its add control and its note`, async () => {
          await chatAnalysisPage.assertLabelSectionIsOffered(section);
          await chatAnalysisPage.assertLabelSectionExplainsItself(section.title);
        });
      }

      const [firstSection] = CHAT_ANALYSIS_LABEL_SECTIONS;
      const label = createChatAnalysisLabel();

      await test.step('A value that was added is listed as a chip that can be dragged and removed', async () => {
        await chatAnalysisPage.addLabel(firstSection.title, label);
        await chatAnalysisPage.assertLabelIsShownAsChip(firstSection.title, label);
        await chatAnalysisPage.assertReorderingIsExplained(firstSection.title);
      });
    },
  );
});
