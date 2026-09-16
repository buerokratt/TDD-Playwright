import { AdminPageFactory } from '@page-objects/admin-page-factory';
import { expect, test } from '@setup/test-setup';
import { ACTION_TIMEOUT, CHAT_ANALYSIS_LABEL_SECTIONS } from '@utils/constants';
import { chatAnalysisCleanup, chatAnalysisConfigRestore, readChatAnalysisConfig } from '@utils/helpers';
import { ChatAnalysisDomainSnapshot, ChatAnalysisSettings } from '@utils/interfaces';
import { createChatAnalysisLabel, createOverlongChatAnalysisLabel } from '@utils/test-data';

const [themeSection, qualitySection] = CHAT_ANALYSIS_LABEL_SECTIONS;
const sectionTitles = CHAT_ANALYSIS_LABEL_SECTIONS.map((section) => section.title);
const addedLabel = createChatAnalysisLabel('autotestaddedfield');
const copiedLabel = createChatAnalysisLabel('autotestcopiedfield');

test.describe('[administration] [functional] Chat analysis settings are saved for the selected domain', () => {
  test.afterEach(chatAnalysisCleanup(() => addedLabel));

  test(
    'A saved label is confirmed and read back after a reload',
    { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/190/' } },
    async ({ page }) => {
      const cap = new AdminPageFactory(page).getChatAnalysisPage();

      await cap.open();

      await test.step('The page opens on a domain of its own', async () => {
        await cap.assertPageIsShown();
        await cap.selectDomainTab();
      });

      await test.step(`Chat analysis is enabled and "${themeSection.title}" section accepts a label from the current run`, async () => {
        await cap.enableAnalysis();
        await cap.addLabel(themeSection.title, addedLabel);
        await cap.assertLabelIsShownAsChip(themeSection.title, addedLabel);
      });

      await test.step('Saving reports the settings went through', async () => {
        await cap.saveSettings();
        await cap.assertSaveWasConfirmed();
      });

      await test.step('The label is still listed after a reload', async () => {
        await cap.open();

        await cap.assertLabelIsShownAsChip(themeSection.title, addedLabel);
      });
    },
  );
});

test.describe('[administration] [functional] A value entered in a label section is listed as a chip', () => {
  test(
    'Every section takes a value, by the add control and by the Enter key',
    { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/192/' } },
    async ({ page }) => {
      const cap = new AdminPageFactory(page).getChatAnalysisPage();

      await cap.open();

      await test.step('The page opens with chat analysis enabled', async () => {
        await cap.assertPageIsShown();
        await cap.enableAnalysis();
      });

      for (const section of CHAT_ANALYSIS_LABEL_SECTIONS) {
        await test.step(`"${section.title}" lists the value its add control was given`, async () => {
          const label = createChatAnalysisLabel('autotestadded');

          await cap.addLabel(section.title, label);
          await cap.assertLabelIsShownAsChip(section.title, label);
        });
      }

      await test.step(`"${themeSection.title}" lists a value entered with the Enter key just as well`, async () => {
        const label = createChatAnalysisLabel('autotestentered');

        await cap.addLabelWithEnter(themeSection.title, label);
        await cap.assertLabelIsShownAsChip(themeSection.title, label);
      });
    },
  );
});

test.describe('[administration] [functional] Settings are copied from one domain onto another', () => {
  let targetSnapshot: ChatAnalysisDomainSnapshot | undefined;

  test.afterEach(chatAnalysisConfigRestore(() => targetSnapshot));
  test.afterEach(chatAnalysisCleanup(() => copiedLabel));

  test(
    'The target domain is confirmed and comes back holding the settings of the source',
    { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/191/' } },
    async ({ page }) => {
      const cap = new AdminPageFactory(page).getChatAnalysisPage();

      await cap.open();

      const domains = await cap.domainTabCount();

      expect(domains, 'Copying settings is only offered where a second domain exists').toBeGreaterThan(1);

      const targetIndex = domains - 1;
      const targetName = await cap.domainTabName(targetIndex);

      await test.step('The settings the target domain holds today are kept to be put back', async () => {
        const targetId = await cap.selectDomainTab(targetIndex);

        targetSnapshot = { domainId: targetId, config: await readChatAnalysisConfig(page, targetId) };
      });

      let sourceSettings: ChatAnalysisSettings;

      await test.step('The source domain is given settings the target does not have', async () => {
        await cap.selectDomainTab();
        await cap.enableAnalysis();
        await cap.addLabel(themeSection.title, copiedLabel);

        await cap.saveSettings();
        await cap.assertSaveWasConfirmed();

        sourceSettings = await cap.readSettings(sectionTitles);
      });

      await test.step(`Copying them onto "${targetName}" reports the settings went through`, async () => {
        await cap.open();
        await cap.selectDomainTab();

        await cap.copySettingsTo(targetName);
        await cap.assertSaveWasConfirmed();
      });

      await test.step('The target domain comes back with the settings of the source', async () => {
        await cap.selectDomainTab(targetIndex);

        await expect
          .poll(() => cap.readSettings(sectionTitles), {
            message: `"${targetName}" came back with settings of its own`,
            timeout: ACTION_TIMEOUT,
          })
          .toEqual(sourceSettings);
      });
    },
  );
});

test.describe('[administration] [functional] A chip is deleted once the deletion is confirmed', () => {
  test(
    'A chip is gone from its section after the confirmation is given',
    { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/194/' } },
    async ({ page }) => {
      const cap = new AdminPageFactory(page).getChatAnalysisPage();
      const label = createChatAnalysisLabel('autotestdeleted');

      await cap.open();

      await test.step('The page opens with chat analysis enabled', async () => {
        await cap.assertPageIsShown();
        await cap.enableAnalysis();
      });

      await test.step(`"${themeSection.title}" holds a label of the run's own to delete`, async () => {
        await cap.addLabel(themeSection.title, label);
        await cap.assertLabelIsShownAsChip(themeSection.title, label);
      });

      await test.step('Confirming the deletion takes the chip out of its section', async () => {
        await cap.deleteLabel(themeSection.title, label);
        await cap.assertLabelIsNotListed(themeSection.title, label);
      });
    },
  );
});

test.describe('[administration] [functional] A label over the length limit is refused', () => {
  test(
    'A value longer than 50 characters is reported and left out of the section',
    { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/193/' } },
    async ({ page }) => {
      const cap = new AdminPageFactory(page).getChatAnalysisPage();

      await cap.open();

      await test.step('The page opens with chat analysis enabled', async () => {
        await cap.assertPageIsShown();
        await cap.enableAnalysis();
      });

      await test.step(`"${themeSection.title}" refuses the value its add control was given`, async () => {
        const label = createOverlongChatAnalysisLabel();

        await cap.addLabel(themeSection.title, label);

        await cap.assertLabelTooLongWasReported();
        await cap.assertLabelIsNotListed(themeSection.title, label);
      });

      await test.step(`"${qualitySection.title}" refuses it through the Enter key just as well`, async () => {
        const label = createOverlongChatAnalysisLabel();

        await cap.addLabelWithEnter(qualitySection.title, label);

        await cap.assertLabelTooLongWasReported();
        await cap.assertLabelIsNotListed(qualitySection.title, label);
      });
    },
  );
});
