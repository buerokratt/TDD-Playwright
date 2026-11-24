import { expect, test } from '@setup/test-setup';
import { ACTION_TIMEOUT, CHAT_ANALYSIS_LABEL_SECTIONS } from '@utils/constants';
import { chatAnalysisCleanup, chatAnalysisConfigRestore, readChatAnalysisConfig } from '@utils/helpers';
import { ChatAnalysisDomainSnapshot, ChatAnalysisSettings } from '@utils/interfaces';
import { createChatAnalysisLabel, createOverlongChatAnalysisLabel } from '@utils/test-data';

const [themeSection, qualitySection] = CHAT_ANALYSIS_LABEL_SECTIONS;
const sectionTitles = CHAT_ANALYSIS_LABEL_SECTIONS.map((section) => section.title);
const addedLabel = createChatAnalysisLabel('autotestaddedfield');
const copiedLabel = createChatAnalysisLabel('autotestcopiedfield');

test.describe('[administration] [functional] A value entered in a label section is listed as a chip', () => {
  test(
    'Every section takes a value, by the add control and by the Enter key',
    { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/192/' } },
    async ({ chatAnalysisPage }) => {
      await chatAnalysisPage.open();

      await test.step('The page opens with chat analysis enabled', async () => {
        await chatAnalysisPage.assertPageIsShown();
        await chatAnalysisPage.enableAnalysis();
      });

      for (const section of CHAT_ANALYSIS_LABEL_SECTIONS) {
        await test.step(`"${section.title}" section lists a label entered through its add control`, async () => {
          const label = createChatAnalysisLabel('autotestadded');

          await chatAnalysisPage.addLabel(section.title, label);
          await chatAnalysisPage.assertLabelIsShownAsChip(section.title, label);
        });
      }

      await test.step(`"${themeSection.title}" section lists a label entered with the Enter key`, async () => {
        const label = createChatAnalysisLabel('autotestentered');

        await chatAnalysisPage.addLabelWithEnter(themeSection.title, label);
        await chatAnalysisPage.assertLabelIsShownAsChip(themeSection.title, label);
      });
    },
  );
});

test.describe('[administration] [functional] A label over the length limit is refused', () => {
  test(
    'A value longer than 50 characters is reported and left out of the section',
    { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/193/' } },
    async ({ chatAnalysisPage }) => {
      await chatAnalysisPage.open();

      await test.step('The page opens with chat analysis enabled', async () => {
        await chatAnalysisPage.assertPageIsShown();
        await chatAnalysisPage.enableAnalysis();
      });

      await test.step(`"${themeSection.title}" section refuses a label entered through its add control`, async () => {
        const label = createOverlongChatAnalysisLabel();

        await chatAnalysisPage.addLabel(themeSection.title, label);

        await chatAnalysisPage.assertLabelTooLongWasReported();
        await chatAnalysisPage.assertLabelIsNotListed(themeSection.title, label);
      });

      await test.step(`"${qualitySection.title}" section refuses a label entered with the Enter key`, async () => {
        const label = createOverlongChatAnalysisLabel();

        await chatAnalysisPage.addLabelWithEnter(qualitySection.title, label);

        await chatAnalysisPage.assertLabelTooLongWasReported();
        await chatAnalysisPage.assertLabelIsNotListed(qualitySection.title, label);
      });
    },
  );
});

test.describe('[administration] [functional] A chip is deleted once the deletion is confirmed', () => {
  test(
    'A chip is gone from its section after the confirmation is given',
    { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/194/' } },
    async ({ chatAnalysisPage }) => {
      const label = createChatAnalysisLabel('autotestdeleted');

      await chatAnalysisPage.open();

      await test.step('The page opens with chat analysis enabled', async () => {
        await chatAnalysisPage.assertPageIsShown();
        await chatAnalysisPage.enableAnalysis();
      });

      await test.step(`"${themeSection.title}" section holds a label from the current run to delete`, async () => {
        await chatAnalysisPage.addLabel(themeSection.title, label);
        await chatAnalysisPage.assertLabelIsShownAsChip(themeSection.title, label);
      });

      await test.step('Confirming the deletion takes the chip out of its section', async () => {
        await chatAnalysisPage.deleteLabel(themeSection.title, label);
        await chatAnalysisPage.assertLabelIsNotListed(themeSection.title, label);
      });
    },
  );
});

test.describe('[administration] [functional] Chat analysis settings are saved for the selected domain', () => {
  test.afterEach(chatAnalysisCleanup(() => addedLabel));

  test(
    'A saved label is confirmed and read back after a reload',
    { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/190/' } },
    async ({ chatAnalysisPage }) => {
      await chatAnalysisPage.open();

      await test.step('The page opens on a domain of its own', async () => {
        await chatAnalysisPage.assertPageIsShown();
        await chatAnalysisPage.selectDomainTab();
      });

      await test.step(`Chat analysis is enabled and "${themeSection.title}" section accepts a label from the current run`, async () => {
        await chatAnalysisPage.enableAnalysis();
        await chatAnalysisPage.addLabel(themeSection.title, addedLabel);
        await chatAnalysisPage.assertLabelIsShownAsChip(themeSection.title, addedLabel);
      });

      await test.step('Saving reports the settings went through', async () => {
        await chatAnalysisPage.saveSettings();
        await chatAnalysisPage.assertSaveWasConfirmed();
      });

      await test.step('The label is still listed after a reload', async () => {
        await chatAnalysisPage.open();

        await chatAnalysisPage.assertLabelIsShownAsChip(themeSection.title, addedLabel);
      });
    },
  );
});

test.describe('[administration] [functional] Settings are copied from one domain to another', () => {
  let targetSnapshot: ChatAnalysisDomainSnapshot | undefined;

  test.afterEach(chatAnalysisConfigRestore(() => targetSnapshot));
  test.afterEach(chatAnalysisCleanup(() => copiedLabel));

  test(
    'The target domain is confirmed and comes back holding the settings of the source',
    { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/191/' } },
    async ({ page, chatAnalysisPage }) => {
      await chatAnalysisPage.open();

      const domains = await chatAnalysisPage.domainTabCount();

      expect(domains, 'Copying settings is only offered where a second domain exists').toBeGreaterThan(1);

      const targetIndex = domains - 1;
      const targetName = await chatAnalysisPage.domainTabName(targetIndex);

      await test.step("The target domain's current settings are saved to be restored later", async () => {
        const targetId = await chatAnalysisPage.selectDomainTab(targetIndex);

        targetSnapshot = { domainId: targetId, config: await readChatAnalysisConfig(page, targetId) };
      });

      let sourceSettings: ChatAnalysisSettings;

      await test.step('The source domain is given settings the target does not have', async () => {
        await chatAnalysisPage.selectDomainTab();
        await chatAnalysisPage.enableAnalysis();
        await chatAnalysisPage.addLabel(themeSection.title, copiedLabel);

        await chatAnalysisPage.saveSettings();
        await chatAnalysisPage.assertSaveWasConfirmed();

        sourceSettings = await chatAnalysisPage.readSettings(sectionTitles);
      });

      await test.step(`Copying them onto "${targetName}" reports the settings went through`, async () => {
        await chatAnalysisPage.open();
        await chatAnalysisPage.selectDomainTab();

        await chatAnalysisPage.copySettingsTo(targetName);
        await chatAnalysisPage.assertSaveWasConfirmed();
      });

      await test.step('The target domain comes back with the settings of the source', async () => {
        await chatAnalysisPage.selectDomainTab(targetIndex);

        await expect
          .poll(() => chatAnalysisPage.readSettings(sectionTitles), {
            message: `"${targetName}" came back with settings of its own`,
            timeout: ACTION_TIMEOUT,
          })
          .toEqual(sourceSettings);
      });
    },
  );
});
