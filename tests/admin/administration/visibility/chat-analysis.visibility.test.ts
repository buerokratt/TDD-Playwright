import { AdminPageFactory } from '@page-objects/admin-page-factory';
import { test } from '@setup/test-setup';
import { CHAT_ANALYSIS_LABEL_SECTIONS } from '@utils/constants';
import { createChatAnalysisLabel } from '@utils/test-data';

test.describe('[administration] [visibility] The chat analysis page shows its domains, its switch and its label sections', () => {
  test(
    'The page opens with every control the analysis is configured through',
    { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/158/' } },
    async ({ page }) => {
      const cap = new AdminPageFactory(page).getChatAnalysisPage();

      await cap.open();

      await test.step('The heading and the save control are on the page', async () => {
        await cap.assertPageIsShown();
      });

      await test.step('The configured domains are offered as tabs with one of them selected', async () => {
        await cap.assertDomainTabsAreShown();
      });

      await test.step('The settings of the selected domain can be copied to another domain', async () => {
        await cap.assertCopyToDomainIsOffered();
      });

      await test.step('Chat analysis can be turned on and off from a switch of its own', async () => {
        await cap.assertAnalysisSwitchIsShown();
        await cap.enableAnalysis();
      });

      for (const section of CHAT_ANALYSIS_LABEL_SECTIONS) {
        await test.step(`"${section.title}" offers its field, its add control and its note`, async () => {
          await cap.assertLabelSectionIsOffered(section);
          await cap.assertLabelSectionExplainsItself(section.title);
        });
      }

      const [firstSection] = CHAT_ANALYSIS_LABEL_SECTIONS;
      const label = createChatAnalysisLabel();

      await test.step('A value that was added is listed as a chip that can be dragged and removed', async () => {
        await cap.addLabel(firstSection.title, label);
        await cap.assertLabelIsShownAsChip(firstSection.title, label);
        await cap.assertReorderingIsExplained(firstSection.title);
      });
    },
  );
});
