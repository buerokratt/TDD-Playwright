import { expect, test } from '@setup/test-setup';
import { AnonymizerSettings } from '@utils/interfaces';
import {
  createAnonymizerEmail,
  createAnonymizerWord,
  nextAnonymizerApproach,
  toggledAnonymizerEntities,
} from '@utils/test-data';

test.describe('[administration] [functional] Anonymizer settings are saved for the selected domain', () => {
  test(
    'Approach, entities, both word lists and both toggles come back from a reload as they were saved',
    { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/172/' } },
    async ({ anonymizerPage }) => {
      await anonymizerPage.open();

      await test.step('The settings are opened on the first domain offered', async () => {
        await anonymizerPage.selectFirstDomain();
      });

      await anonymizerPage.withSettingsRestored(async (settingsBefore) => {
        const settings: AnonymizerSettings = {
          approach: nextAnonymizerApproach(settingsBefore.approach),
          entities: toggledAnonymizerEntities(settingsBefore.entities),
          allowlist: [createAnonymizerWord('allow')],
          denylist: [createAnonymizerWord('deny')],
          anonymizationBeforeLlm: !settingsBefore.anonymizationBeforeLlm,
          recordAnonymously: !settingsBefore.recordAnonymously,
        };

        await test.step('Saving the changed settings is confirmed on the page', async () => {
          await anonymizerPage.applySettings(settings);
          await anonymizerPage.saveSettings();
          await anonymizerPage.assertSaveWasConfirmed();
        });

        await test.step('The page reopens holding the settings that were saved', async () => {
          await anonymizerPage.open();
          await anonymizerPage.assertSettingsStored(settings);
        });
      });
    },
  );
});

test.describe('[administration] [functional] The anonymizer testing card anonymizes text by the settings of the domain', () => {
  test(
    'Anonymize hides the entity value and the denied word, keeps the allowed one, and Clear empties the input',
    { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/175/' } },
    async ({ anonymizerPage }) => {
      const anonymizedEmail = createAnonymizerEmail('anonymized');
      const allowedEmail = createAnonymizerEmail('allowed');
      const deniedWord = createAnonymizerWord('deny');
      const untouchedWord = createAnonymizerWord('random');

      const textToAnonymize = [
        `Write to ${anonymizedEmail} or to ${allowedEmail}.`,
        `The word ${deniedWord} is denied and ${untouchedWord} is nothing at all.`,
      ].join(' ');

      await anonymizerPage.open();

      await test.step('The settings are opened on the first domain offered', async () => {
        await anonymizerPage.selectFirstDomain();
      });

      await anonymizerPage.withSettingsRestored(async (settingsBefore) => {
        const settings: AnonymizerSettings = {
          approach: 'Replace',
          entities: ['EMAIL_ADDRESS'],
          allowlist: [allowedEmail],
          denylist: [deniedWord],
          anonymizationBeforeLlm: settingsBefore.anonymizationBeforeLlm,
          recordAnonymously: settingsBefore.recordAnonymously,
        };

        await test.step('The domain is set to replace e-mail addresses, with one address allowed and one word denied', async () => {
          await anonymizerPage.applySettings(settings);
          await anonymizerPage.saveSettings();
          await anonymizerPage.assertSaveWasConfirmed();
        });

        await test.step('Anonymizing the text is confirmed on the page', async () => {
          await anonymizerPage.anonymize(textToAnonymize);
          await anonymizerPage.assertAnonymizationWasConfirmed();
        });

        await test.step('The output hides the address and the denied word, and keeps the allowed address and the rest of the text', async () => {
          await anonymizerPage.assertOutputWasAnonymized({
            hidden: [anonymizedEmail, deniedWord],
            kept: [allowedEmail, untouchedWord],
          });
        });

        await test.step('Clearing the testing card empties the text that was entered', async () => {
          await anonymizerPage.clearTestingInput();
          await anonymizerPage.assertTestingInputIsCleared();
        });
      });
    },
  );
});

test.describe('[administration] [functional] Anonymizer settings are copied from one domain to another', () => {
  test(
    'The target domain is confirmed and comes back holding the settings of the source',
    { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/173/' } },
    async ({ anonymizerPage }) => {
      await anonymizerPage.open();

      const domains = await anonymizerPage.domainNames();
      expect(domains.length, 'Copying settings is only offered where a second domain exists').toBeGreaterThan(1);

      const [source, target] = domains;

      await anonymizerPage.withSettingsRestoredForDomains([source, target], async (settingsBefore) => {
        const settings: AnonymizerSettings = {
          approach: 'Replace',
          entities: ['EMAIL_ADDRESS'],
          allowlist: [createAnonymizerWord('allow')],
          denylist: [createAnonymizerWord('deny')],
          anonymizationBeforeLlm: settingsBefore[source].anonymizationBeforeLlm,
          recordAnonymously: settingsBefore[source].recordAnonymously,
        };

        await test.step('The source domain is given settings the target does not have', async () => {
          await anonymizerPage.selectDomain(source);
          await anonymizerPage.applySettings(settings);
          await anonymizerPage.saveSettings();
          await anonymizerPage.assertSaveWasConfirmed();

          expect(
            settingsBefore[target],
            `"${target}" already holds the settings that are about to be copied onto it`,
          ).not.toEqual(settings);
        });

        await test.step(`Copying them onto "${target}" reports the settings went through`, async () => {
          await anonymizerPage.copySettingsTo(target);
          await anonymizerPage.assertSaveWasConfirmed();
        });

        await test.step('The target domain comes back with the settings of the source', async () => {
          await anonymizerPage.selectDomain(target);
          await anonymizerPage.assertSettingsStored(settings);
        });
      });
    },
  );
});
