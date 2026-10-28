import { expect, test } from '@setup/test-setup';
import { ANONYMIZER_APPROACHES, ANONYMIZER_DENYLIST_PLACEHOLDER } from '@utils/constants';
import { assertAnonymizerSettingsUnchanged, readStoredAnonymizerSettings, readWidgetDomainId } from '@utils/helpers';
import { AnonymizerSettings, AnonymizerSettingsPayload } from '@utils/interfaces';
import {
  ANONYMIZED_IBAN,
  ANONYMIZER_SAMPLE_IBAN,
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

  test(
    'Text with nothing to hide comes back unchanged',
    { annotation: { type: 'NO KIWI TEST CASE', description: 'Extension of the anonymizer testing card coverage.' } },
    async ({ page, anonymizerPage }) => {
      const sentence = 'hello there friend, nothing to hide here';

      await anonymizerPage.open();

      const domain = await anonymizerPage.selectFirstDomain();
      const domainId = await readWidgetDomainId(page, domain);
      const response = await anonymizerPage.anonymizeReadingResponse(sentence);

      await test.step('The back office anonymizes the text', async () => {
        expect(response.ok(), `The back office would not anonymize (${response.status()})`).toBeTruthy();
      });

      await test.step('The text and the selected domain are sent', async () => {
        expect(response.request().postDataJSON(), 'The testing card sent something else').toEqual({
          text: sentence,
          domain: domainId,
        });
      });

      await test.step('The back office answers the text unchanged', async () => {
        expect(await response.json(), 'The back office changed text with nothing to hide').toEqual({
          response: sentence,
        });
      });

      await test.step('Anonymizing the text is confirmed on the page', async () => {
        await anonymizerPage.assertAnonymizationWasConfirmed();
      });

      await test.step('The output equals the input', async () => {
        await anonymizerPage.assertOutputIs(sentence);
      });
    },
  );

  test(
    'Each approach hides an IBAN in its own form',
    { annotation: { type: 'NO KIWI TEST CASE', description: 'Extension of the anonymizer testing card coverage.' } },
    async ({ page, anonymizerPage }) => {
      const text = `IBAN ${ANONYMIZER_SAMPLE_IBAN}`;

      await anonymizerPage.open();

      const domain = await anonymizerPage.selectFirstDomain();
      const domainId = await readWidgetDomainId(page, domain);
      const snapshot = await readStoredAnonymizerSettings(page, domainId);

      await anonymizerPage.withSettingsRestored(async (settingsBefore) => {
        for (const approach of ANONYMIZER_APPROACHES) {
          await anonymizerPage.applySettings({ ...settingsBefore, approach, entities: ['IBAN_CODE'] });

          const savedResponse = await anonymizerPage.saveSettingsReadingResponse();

          await test.step(`The back office accepts "${approach}" for IBAN codes`, async () => {
            expect(
              savedResponse.ok(),
              `The back office rejected "${approach}" (${savedResponse.status()})`,
            ).toBeTruthy();
          });

          await test.step(`Saving "${approach}" is confirmed on the page`, async () => {
            await anonymizerPage.assertSaveWasConfirmed();
          });

          const anonymizedResponse = await anonymizerPage.anonymizeReadingResponse(text);

          await test.step(`The back office anonymizes the IBAN with "${approach}"`, async () => {
            expect(
              anonymizedResponse.ok(),
              `The back office would not anonymize with "${approach}" (${anonymizedResponse.status()})`,
            ).toBeTruthy();
          });

          await test.step(`"${approach}" hides the IBAN in its own form`, async () => {
            await anonymizerPage.assertOutputIs(ANONYMIZED_IBAN[approach]);
          });
        }
      });

      await test.step('The stored settings equal the snapshot once the run is over', async () => {
        await assertAnonymizerSettingsUnchanged(page, domainId, snapshot);
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

      const domains = await anonymizerPage.readDomainNames();
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

  test(
    'The dialog offers every other domain and allows copying only while a target is chosen',
    { annotation: { type: 'NO KIWI TEST CASE', description: 'Extension of the anonymizer copy coverage.' } },
    async ({ anonymizerPage }) => {
      await anonymizerPage.open();

      const domains = await anonymizerPage.readDomainNames();
      const source = await anonymizerPage.selectFirstDomain();
      const targets = domains.filter((domain) => domain !== source);
      const [target] = targets;
      const dialog = anonymizerPage.getCopyToDomainModal();

      expect(target, 'Copying settings is only offered where a second domain exists').toBeTruthy();

      await dialog.open();

      await test.step('The dialog is titled "Copy to domain"', async () => {
        await dialog.assertTitleIsShown();
      });

      await test.step('The dialog explains what it copies', async () => {
        await dialog.assertExplanationIsShown();
      });

      await test.step('No target domain is chosen yet', async () => {
        await dialog.assertChoiceShows('Choose');
      });

      await test.step('Copy is disabled while no target is chosen', async () => {
        await dialog.assertCopyIsDisabled();
      });

      await test.step('Cancel is enabled', async () => {
        await dialog.assertCancelIsEnabled();
      });

      await test.step(`Every domain but "${source}" is offered as a target`, async () => {
        await dialog.openTargets();
        await dialog.assertTargetsOffered(targets);
      });

      await dialog.toggleTarget(target);
      await dialog.closeTargets();

      await test.step(`Choosing "${target}" counts one target`, async () => {
        await dialog.assertChoiceShows('Chosen (1)');
      });

      await test.step('Copy is enabled once a target is chosen', async () => {
        await dialog.assertCopyIsEnabled();
      });

      await dialog.openTargets();
      await dialog.toggleTarget(target);
      await dialog.closeTargets();

      await test.step(`Copy is disabled again once "${target}" is unchecked`, async () => {
        await dialog.assertCopyIsDisabled();
      });
    },
  );

  test(
    'Cancel, Escape and the close icon close the dialog without copying and reset the choice',
    { annotation: { type: 'NO KIWI TEST CASE', description: 'Extension of the anonymizer copy coverage.' } },
    async ({ anonymizerPage }) => {
      await anonymizerPage.open();

      const domains = await anonymizerPage.readDomainNames();
      const source = await anonymizerPage.selectFirstDomain();
      const [target] = domains.filter((domain) => domain !== source);
      const dialog = anonymizerPage.getCopyToDomainModal();
      const transfers = anonymizerPage.watchTransfers();

      expect(target, 'Copying settings is only offered where a second domain exists').toBeTruthy();

      await dialog.open();
      await dialog.openTargets();
      await dialog.toggleTarget(target);
      await dialog.closeTargets();
      await dialog.cancel();

      await test.step('Cancel closes the dialog', async () => {
        await dialog.assertIsClosed();
      });

      await dialog.open();

      await test.step('The reopened dialog has no target chosen', async () => {
        await dialog.assertChoiceShows('Choose');
      });

      await test.step('Copy is disabled in the reopened dialog', async () => {
        await dialog.assertCopyIsDisabled();
      });

      await dialog.closeWithEscape();

      await test.step('Escape closes the dialog', async () => {
        await dialog.assertIsClosed();
      });

      await dialog.open();
      await dialog.closeWithIcon();

      await test.step('The close icon closes the dialog', async () => {
        await dialog.assertIsClosed();
      });

      await test.step('Closing the dialog never copies the settings', async () => {
        expect(transfers, 'Closing the copy dialog copied the settings').toHaveLength(0);
      });
    },
  );
});

test.describe('[administration] [functional] Anonymizer settings are posted as read and the approach in lower case', () => {
  test(
    'Saving untouched settings is accepted and leaves the stored settings as they were',
    { annotation: { type: 'NO KIWI TEST CASE', description: 'Extension of the anonymizer save coverage.' } },
    async ({ page, anonymizerPage }) => {
      await anonymizerPage.open();

      const domain = await anonymizerPage.selectFirstDomain();
      const domainId = await readWidgetDomainId(page, domain);
      const snapshot = await readStoredAnonymizerSettings(page, domainId);

      await anonymizerPage.withSettingsRestored(async () => {
        const response = await anonymizerPage.saveSettingsReadingResponse();

        await test.step('The back office accepts the untouched settings', async () => {
          expect(response.ok(), `The back office rejected the untouched settings (${response.status()})`).toBeTruthy();
        });

        await test.step('Saving the untouched settings is confirmed on the page', async () => {
          await anonymizerPage.assertSaveWasConfirmed();
        });

        await test.step('The stored settings equal the ones read before saving', async () => {
          await assertAnonymizerSettingsUnchanged(page, domainId, snapshot);
        });
      });
    },
  );

  test(
    'Each approach is posted as its lower-case value and Escape closes the dropdown unchanged',
    { annotation: { type: 'NO KIWI TEST CASE', description: 'Extension of the anonymizer save coverage.' } },
    async ({ page, anonymizerPage }) => {
      await anonymizerPage.open();

      const domain = await anonymizerPage.selectFirstDomain();
      const domainId = await readWidgetDomainId(page, domain);
      const snapshot = await readStoredAnonymizerSettings(page, domainId);
      const lastApproach = ANONYMIZER_APPROACHES[ANONYMIZER_APPROACHES.length - 1];

      await anonymizerPage.withSettingsRestored(async () => {
        for (const approach of ANONYMIZER_APPROACHES) {
          await test.step(`The approach dropdown shows "${approach}" once it is chosen`, async () => {
            await anonymizerPage.selectApproach(approach);
            await anonymizerPage.assertApproachShown(approach);
          });

          const response = await anonymizerPage.saveSettingsReadingResponse();
          const payload = response.request().postDataJSON() as AnonymizerSettingsPayload;

          await test.step(`The back office accepts the settings saved with "${approach}"`, async () => {
            expect(
              response.ok(),
              `The back office rejected the "${approach}" approach (${response.status()})`,
            ).toBeTruthy();
          });

          await test.step(`"${approach}" is posted as "${approach.toLowerCase()}"`, async () => {
            expect(payload.anonymizerSelectedApproach, `"${approach}" was posted under another value`).toBe(
              approach.toLowerCase(),
            );
          });

          await test.step(`Every other field saved with "${approach}" equals the settings read`, async () => {
            expect(payload, `Saving "${approach}" changed more than the approach`).toEqual({
              ...snapshot,
              anonymizerSelectedApproach: approach.toLowerCase(),
              domainUUID: [domainId],
            });
          });
        }

        await anonymizerPage.openApproachList();
        await anonymizerPage.closeApproachListWithEscape();

        await test.step('Escape closes the approach list', async () => {
          await anonymizerPage.assertApproachListClosed();
        });

        await test.step('Escape leaves the chosen approach in place', async () => {
          await anonymizerPage.assertApproachShown(lastApproach);
        });
      });

      await test.step('The stored settings equal the snapshot once the run is over', async () => {
        await assertAnonymizerSettingsUnchanged(page, domainId, snapshot);
      });
    },
  );
});

test.describe('[administration] [functional] Anonymizer word lists take only whole new words and the denylist wins', () => {
  test(
    'Empty, whitespace and exact duplicate words are not added, a case variant is',
    { annotation: { type: 'NO KIWI TEST CASE', description: 'Extension of the anonymizer word list coverage.' } },
    async ({ anonymizerPage }) => {
      const word = createAnonymizerWord('allow');

      await anonymizerPage.open();

      const settingsBefore = await anonymizerPage.readSettings();

      await test.step('Enter on an empty value adds no word', async () => {
        await anonymizerPage.enterWord('allowlist', '');
        await anonymizerPage.assertWordsListed('allowlist', settingsBefore.allowlist);
      });

      await test.step('Enter on whitespace adds no word', async () => {
        await anonymizerPage.enterWord('allowlist', '   ');
        await anonymizerPage.assertWordsListed('allowlist', settingsBefore.allowlist);
      });

      await test.step('A new word is added once', async () => {
        await anonymizerPage.enterWord('allowlist', word);
        await anonymizerPage.assertWordsListed('allowlist', [...settingsBefore.allowlist, word]);
      });

      await test.step('The same word entered again is not added twice', async () => {
        await anonymizerPage.enterWord('allowlist', word);
        await anonymizerPage.assertWordsListed('allowlist', [...settingsBefore.allowlist, word]);
      });

      await test.step('The same word in upper case is added as a separate word', async () => {
        await anonymizerPage.enterWord('allowlist', word.toUpperCase());
        await anonymizerPage.assertWordsListed('allowlist', [...settingsBefore.allowlist, word, word.toUpperCase()]);
      });

      await test.step('The reloaded page holds the stored settings again', async () => {
        await anonymizerPage.open();
        await anonymizerPage.assertSettingsStored(settingsBefore);
      });
    },
  );

  test(
    'A word typed without Enter is neither listed nor saved and stays in the input',
    { annotation: { type: 'NO KIWI TEST CASE', description: 'Extension of the anonymizer word list coverage.' } },
    async ({ page, anonymizerPage }) => {
      const word = createAnonymizerWord('deny');

      await anonymizerPage.open();

      const domain = await anonymizerPage.selectFirstDomain();
      const domainId = await readWidgetDomainId(page, domain);
      const snapshot = await readStoredAnonymizerSettings(page, domainId);

      await anonymizerPage.withSettingsRestored(async (settingsBefore) => {
        await anonymizerPage.typeWordWithoutEnter('denylist', word);

        await test.step('The typed word is not listed', async () => {
          await anonymizerPage.assertWordsListed('denylist', settingsBefore.denylist);
        });

        const response = await anonymizerPage.saveSettingsReadingResponse();

        await test.step('The back office accepts the settings', async () => {
          expect(response.ok(), `The back office rejected the settings (${response.status()})`).toBeTruthy();
        });

        await test.step('The denylist is saved without the typed word', async () => {
          const payload = response.request().postDataJSON() as AnonymizerSettingsPayload;

          expect(payload.anonymizerDenylist.split(','), 'A word typed without Enter was saved').not.toContain(word);
        });

        await test.step('The typed word is left in the denylist input with no warning', async () => {
          await anonymizerPage.assertWordInputHolds('denylist', word);
        });

        await test.step('The stored settings are unchanged', async () => {
          await assertAnonymizerSettingsUnchanged(page, domainId, snapshot);
        });
      });
    },
  );

  test(
    'The denylist hides whole words in any case, keeps allowed and glued words, and wins over the allowlist',
    { annotation: { type: 'NO KIWI TEST CASE', description: 'Extension of the anonymizer word list coverage.' } },
    async ({ page, anonymizerPage }) => {
      const deniedWord = createAnonymizerWord('deny');
      const allowedWord = createAnonymizerWord('allow');
      const sharedWord = createAnonymizerWord('both');
      const placeholder = ANONYMIZER_DENYLIST_PLACEHOLDER;

      await anonymizerPage.open();

      const domain = await anonymizerPage.selectFirstDomain();
      const domainId = await readWidgetDomainId(page, domain);
      const snapshot = await readStoredAnonymizerSettings(page, domainId);

      await anonymizerPage.withSettingsRestored(async (settingsBefore) => {
        const separateLists: AnonymizerSettings = {
          ...settingsBefore,
          approach: 'Replace',
          entities: ['IBAN_CODE'],
          allowlist: [allowedWord],
          denylist: [deniedWord],
        };

        await anonymizerPage.applySettings(separateLists);

        const savedResponse = await anonymizerPage.saveSettingsReadingResponse();

        await test.step('The back office accepts one denied and one allowed word', async () => {
          expect(
            savedResponse.ok(),
            `The back office rejected the word lists (${savedResponse.status()})`,
          ).toBeTruthy();
        });

        await test.step('Saving the word lists is confirmed on the page', async () => {
          await anonymizerPage.assertSaveWasConfirmed();
        });

        const anonymizedResponse = await anonymizerPage.anonymizeReadingResponse(
          `first ${deniedWord} then ${deniedWord.toUpperCase()} then x${deniedWord} then ${allowedWord} end`,
        );

        await test.step('The back office anonymizes the text', async () => {
          expect(
            anonymizedResponse.ok(),
            `The back office would not anonymize (${anonymizedResponse.status()})`,
          ).toBeTruthy();
        });

        await test.step('The denied word and its upper-case form are replaced', async () => {
          await anonymizerPage.assertOutputContains(`first ${placeholder} then ${placeholder} then`);
        });

        await test.step('A word glued to the denied one is kept', async () => {
          await anonymizerPage.assertOutputContains(`then x${deniedWord} then`);
        });

        await test.step('The allowed word is kept', async () => {
          await anonymizerPage.assertOutputContains(allowedWord);
        });

        await anonymizerPage.applySettings({ ...separateLists, allowlist: [sharedWord], denylist: [sharedWord] });

        const savedSharedResponse = await anonymizerPage.saveSettingsReadingResponse();

        await test.step('The back office accepts the same word in both lists', async () => {
          expect(
            savedSharedResponse.ok(),
            `The back office rejected the same word in both lists (${savedSharedResponse.status()})`,
          ).toBeTruthy();
        });

        const anonymizedSharedResponse = await anonymizerPage.anonymizeReadingResponse(
          `the word ${sharedWord} sits in both lists`,
        );

        await test.step('The back office anonymizes the word held in both lists', async () => {
          expect(
            anonymizedSharedResponse.ok(),
            `The back office would not anonymize (${anonymizedSharedResponse.status()})`,
          ).toBeTruthy();
        });

        await test.step('A word in both lists is hidden: the denylist wins', async () => {
          await anonymizerPage.assertOutputIs(`the word ${placeholder} sits in both lists`);
        });
      });

      await test.step('The stored settings equal the snapshot once the run is over', async () => {
        await assertAnonymizerSettingsUnchanged(page, domainId, snapshot);
      });
    },
  );
});

test.describe('[administration] [functional] Anonymizer domain tabs load their own settings', () => {
  test(
    'Each domain tab shows the settings saved for that domain',
    { annotation: { type: 'NO KIWI TEST CASE', description: 'Extension of the anonymizer domain coverage.' } },
    async ({ anonymizerPage }) => {
      await anonymizerPage.open();

      const domains = await anonymizerPage.readDomainNames();
      expect(domains.length, 'Switching tabs is only possible where a second domain exists').toBeGreaterThan(1);

      const [first, second] = domains;

      await anonymizerPage.withSettingsRestoredForDomains([first, second], async (settingsBefore) => {
        const firstSettings: AnonymizerSettings = {
          ...settingsBefore[first],
          allowlist: [createAnonymizerWord('first')],
        };
        const secondSettings: AnonymizerSettings = {
          ...settingsBefore[second],
          allowlist: [createAnonymizerWord('second')],
        };

        await test.step(`"${first}" and "${second}" are saved with different allowlists`, async () => {
          await anonymizerPage.selectDomain(first);
          await anonymizerPage.applySettings(firstSettings);
          await anonymizerPage.saveSettings();
          await anonymizerPage.assertSaveWasConfirmed();

          await anonymizerPage.selectDomain(second);
          await anonymizerPage.applySettings(secondSettings);
          await anonymizerPage.saveSettings();
          await anonymizerPage.assertSaveWasConfirmed();
        });

        await test.step(`Switching to "${first}" makes it the only tab selected`, async () => {
          await anonymizerPage.selectDomain(first);
          await anonymizerPage.assertDomainActive(first);
        });

        await test.step(`The form shows the settings saved for "${first}"`, async () => {
          await anonymizerPage.assertSettingsStored(firstSettings);
        });

        await test.step(`Switching to "${second}" makes it the only tab selected`, async () => {
          await anonymizerPage.selectDomain(second);
          await anonymizerPage.assertDomainActive(second);
        });

        await test.step(`The form shows the settings saved for "${second}"`, async () => {
          await anonymizerPage.assertSettingsStored(secondSettings);
        });
      });
    },
  );

  test(
    'The selected domain stays selected after a reload',
    { annotation: { type: 'NO KIWI TEST CASE', description: 'Extension of the anonymizer domain coverage.' } },
    async ({ anonymizerPage }) => {
      await anonymizerPage.open();

      const [, domain] = await anonymizerPage.readDomainNames();

      expect(domain, 'Selecting another domain is only possible where a second one exists').toBeTruthy();

      await anonymizerPage.selectDomain(domain);

      await test.step('The page is reloaded', async () => {
        await anonymizerPage.open();
      });

      await test.step(`"${domain}" is still the selected tab`, async () => {
        await anonymizerPage.assertDomainActive(domain);
      });
    },
  );
});
