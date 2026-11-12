import { expect, test } from '@setup/test-setup';
import { ANONYMIZER_APPROACHES, AnonymizerApproach } from '@utils/constants';
import { AnonymizerSettings } from '@utils/interfaces';
import {
  createAnonymizerEmail,
  createAnonymizerWord,
  nextAnonymizerApproach,
  toggledAnonymizerEntities,
} from '@utils/test-data';

test.describe('[administration] [functional] Words are added to and removed from the anonymizer word lists', () => {
  test(
    'A new word is listed in each list, its upper-case variant as a separate word',
    { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/211/' } },
    async ({ anonymizerPage }) => {
      const allowedWord = createAnonymizerWord('allow');
      const deniedWord = createAnonymizerWord('deny');

      await anonymizerPage.open();

      const settingsBefore = await anonymizerPage.readSettings();

      await test.step('Each list lists the word entered into it', async () => {
        await anonymizerPage.enterWord('allowlist', allowedWord);
        await anonymizerPage.enterWord('denylist', deniedWord);
        await anonymizerPage.assertWordsListed('allowlist', [...settingsBefore.allowlist, allowedWord]);
        await anonymizerPage.assertWordsListed('denylist', [...settingsBefore.denylist, deniedWord]);
      });

      await test.step('The upper-case variant of a listed word is added as a separate word', async () => {
        await anonymizerPage.enterWord('allowlist', allowedWord.toUpperCase());
        await anonymizerPage.enterWord('denylist', deniedWord.toUpperCase());
        await anonymizerPage.assertWordsListed('allowlist', [
          ...settingsBefore.allowlist,
          allowedWord,
          allowedWord.toUpperCase(),
        ]);
        await anonymizerPage.assertWordsListed('denylist', [
          ...settingsBefore.denylist,
          deniedWord,
          deniedWord.toUpperCase(),
        ]);
      });
    },
  );

  test(
    'Empty, whitespace and already listed words are not added',
    { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/212/' } },
    async ({ anonymizerPage }) => {
      const allowedWord = createAnonymizerWord('allow');
      const deniedWord = createAnonymizerWord('deny');

      await anonymizerPage.open();

      const settingsBefore = await anonymizerPage.readSettings();

      await test.step('Enter on an empty value adds no word', async () => {
        await anonymizerPage.enterWord('allowlist', '');
        await anonymizerPage.enterWord('denylist', '');
        await anonymizerPage.assertWordsListed('allowlist', settingsBefore.allowlist);
        await anonymizerPage.assertWordsListed('denylist', settingsBefore.denylist);
      });

      await test.step('Enter on whitespace adds no word', async () => {
        await anonymizerPage.enterWord('allowlist', '   ');
        await anonymizerPage.enterWord('denylist', '   ');
        await anonymizerPage.assertWordsListed('allowlist', settingsBefore.allowlist);
        await anonymizerPage.assertWordsListed('denylist', settingsBefore.denylist);
      });

      await test.step('A word entered again is not listed twice', async () => {
        await anonymizerPage.enterWord('allowlist', allowedWord);
        await anonymizerPage.enterWord('allowlist', allowedWord);
        await anonymizerPage.enterWord('denylist', deniedWord);
        await anonymizerPage.enterWord('denylist', deniedWord);
        await anonymizerPage.assertWordsListed('allowlist', [...settingsBefore.allowlist, allowedWord]);
        await anonymizerPage.assertWordsListed('denylist', [...settingsBefore.denylist, deniedWord]);
      });
    },
  );

  test(
    'A removed word is gone from its list',
    { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/213/' } },
    async ({ anonymizerPage }) => {
      const allowedWord = createAnonymizerWord('allow');
      const deniedWord = createAnonymizerWord('deny');

      await anonymizerPage.open();

      const settingsBefore = await anonymizerPage.readSettings();

      await test.step('Each list holds a word from the current run to remove', async () => {
        await anonymizerPage.enterWord('allowlist', allowedWord);
        await anonymizerPage.enterWord('denylist', deniedWord);
        await anonymizerPage.assertWordsListed('allowlist', [...settingsBefore.allowlist, allowedWord]);
        await anonymizerPage.assertWordsListed('denylist', [...settingsBefore.denylist, deniedWord]);
      });

      await test.step('Removing the word takes it out of its list', async () => {
        await anonymizerPage.removeWord('allowlist', allowedWord);
        await anonymizerPage.removeWord('denylist', deniedWord);
        await anonymizerPage.assertWordsListed('allowlist', settingsBefore.allowlist);
        await anonymizerPage.assertWordsListed('denylist', settingsBefore.denylist);
      });
    },
  );
});

test.describe(
  '[administration] [functional] Anonymizer settings are saved for the selected domain',
  { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/172/' } },
  () => {
    test('Approach, entities, both word lists and both toggles come back from a reload as they were saved', async ({
      anonymizerPage,
    }) => {
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
    });

    test('Saving without a change keeps the stored settings', async ({ anonymizerPage }) => {
      await anonymizerPage.open();

      await test.step('The settings are opened on the first domain offered', async () => {
        await anonymizerPage.selectFirstDomain();
      });

      await anonymizerPage.withSettingsRestored(async (settingsBefore) => {
        await test.step('Saving the untouched page reports the change went through', async () => {
          await anonymizerPage.saveSettings();
          await anonymizerPage.assertSaveWasConfirmed();
        });

        await test.step('The settings come back unchanged after a reload', async () => {
          await anonymizerPage.open();
          await anonymizerPage.assertSettingsStored(settingsBefore);
        });
      });
    });

    test('Each domain tab shows the settings saved for that domain', async ({ anonymizerPage }) => {
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

        await test.step(`"${first}" is saved with its own allowlist`, async () => {
          await anonymizerPage.selectDomain(first);
          await anonymizerPage.applySettings(firstSettings);
          await anonymizerPage.saveSettings();
          await anonymizerPage.assertSaveWasConfirmed();
        });

        await test.step(`"${second}" is saved with its own allowlist`, async () => {
          await anonymizerPage.selectDomain(second);
          await anonymizerPage.applySettings(secondSettings);
          await anonymizerPage.saveSettings();
          await anonymizerPage.assertSaveWasConfirmed();
        });

        await test.step(`Switching to "${first}" shows the settings saved for it`, async () => {
          await anonymizerPage.selectDomain(first);
          await anonymizerPage.assertSettingsStored(firstSettings);
        });

        await test.step(`Switching to "${second}" shows the settings saved for it`, async () => {
          await anonymizerPage.selectDomain(second);
          await anonymizerPage.assertSettingsStored(secondSettings);
        });
      });
    });
  },
);

test.describe('[administration] [functional] A word typed without Enter is not added to the anonymizer word lists', () => {
  test(
    'A word typed without Enter in either list is neither listed nor saved and stays in the input',
    { annotation: { type: 'NO KIWI TEST CASE', description: 'Extension of the anonymizer word list add coverage.' } },
    async ({ anonymizerPage }) => {
      const allowedWord = createAnonymizerWord('allow');
      const deniedWord = createAnonymizerWord('deny');

      await anonymizerPage.open();
      await anonymizerPage.selectFirstDomain();

      await anonymizerPage.withSettingsRestored(async (settingsBefore) => {
        await anonymizerPage.typeWordWithoutEnter('allowlist', allowedWord);
        await anonymizerPage.typeWordWithoutEnter('denylist', deniedWord);

        await test.step('Neither typed word is listed', async () => {
          await anonymizerPage.assertWordsListed('allowlist', settingsBefore.allowlist);
          await anonymizerPage.assertWordsListed('denylist', settingsBefore.denylist);
        });

        await test.step('Each typed word is left in its input', async () => {
          await anonymizerPage.assertWordInputHolds('allowlist', allowedWord);
          await anonymizerPage.assertWordInputHolds('denylist', deniedWord);
        });

        await test.step('Saving reports the change went through', async () => {
          await anonymizerPage.saveSettings();
          await anonymizerPage.assertSaveWasConfirmed();
        });

        await test.step('The settings come back without the typed words after a reload', async () => {
          await anonymizerPage.open();
          await anonymizerPage.assertSettingsStored(settingsBefore);
        });
      });
    },
  );
});

test.describe('[administration] [functional] The anonymizer testing card anonymizes text by the settings of the domain', () => {
  test(
    'Entity value and the denied word are hidden, the allowed word and the rest stay, the entered text is emptied',
    { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/175/' } },
    async ({ anonymizerPage }) => {
      const email = createAnonymizerEmail('entity');
      const allowedWord = createAnonymizerWord('allowed');
      const deniedWord = createAnonymizerWord('denied');
      const randomWord = createAnonymizerWord('random');

      const textToAnonymize = [
        `Write to ${email}.`,
        `The word ${deniedWord} is denied, ${allowedWord} is allowed and ${randomWord} is nothing at all.`,
      ].join(' ');

      await anonymizerPage.open();

      await test.step('The settings are opened on the first domain offered', async () => {
        await anonymizerPage.selectFirstDomain();
      });

      await anonymizerPage.withSettingsRestored(async (settingsBefore) => {
        const settings: AnonymizerSettings = {
          ...settingsBefore,
          approach: 'Replace',
          entities: ['EMAIL_ADDRESS'],
          allowlist: [allowedWord],
          denylist: [deniedWord],
        };

        await test.step('The domain is set to replace e-mail addresses, with one word allowed and one word denied', async () => {
          await anonymizerPage.applySettings(settings);
          await anonymizerPage.saveSettings();
          await anonymizerPage.assertSaveWasConfirmed();
        });

        await test.step('Anonymizing the text is confirmed on the page', async () => {
          await anonymizerPage.anonymize(textToAnonymize);
          await anonymizerPage.assertAnonymizationWasConfirmed();
        });

        await test.step('The output hides the address and the denied word, and keeps the allowed word and the rest of the text', async () => {
          await anonymizerPage.assertOutputIs(
            `Write to [EMAIL_ADDRESS]. The word [REDACTED] is denied, ${allowedWord} is allowed and ${randomWord} is nothing at all.`,
          );
        });

        await test.step('Clearing the testing card empties the text that was entered', async () => {
          await anonymizerPage.clearTestingInput();
          await anonymizerPage.assertTestingInputIsCleared();
        });
      });
    },
  );

  test(
    'Matched value is hidden in its own form for each approach',
    { annotation: { type: 'NO KIWI TEST CASE', description: 'Extension of the anonymizer testing card coverage.' } },
    async ({ anonymizerPage }) => {
      const email = createAnonymizerEmail('entity');
      const deniedWord = createAnonymizerWord('denied');
      const text = `mail ${email} word ${deniedWord} end`;
      const anonymizedText: Record<AnonymizerApproach, string | RegExp> = {
        Replace: 'mail [EMAIL_ADDRESS] word [REDACTED] end',
        Redact: 'mail  word  end',
        Mask: `mail xxxxxx${email.slice(6)} word <DENYLIST_MATCH> end`,
        Hash: /^mail [0-9a-f]{64} word [0-9a-f]{64} end$/,
      };

      await anonymizerPage.open();
      await anonymizerPage.selectFirstDomain();

      await anonymizerPage.withSettingsRestored(async (settingsBefore) => {
        for (const approach of ANONYMIZER_APPROACHES) {
          await test.step(`The domain is set to "${approach}" for e-mail addresses with one word denied`, async () => {
            await anonymizerPage.applySettings({
              ...settingsBefore,
              approach,
              entities: ['EMAIL_ADDRESS'],
              allowlist: [],
              denylist: [deniedWord],
            });
            await anonymizerPage.saveSettings();
            await anonymizerPage.assertSaveWasConfirmed();
          });

          await test.step(`"${approach}" hides the address and the denied word in its own form`, async () => {
            await anonymizerPage.anonymize(text);
            await anonymizerPage.assertOutputIs(anonymizedText[approach]);
          });
        }
      });
    },
  );

  test(
    'Entity value is kept when allowlisted and hidden when it is not',
    { annotation: { type: 'NO KIWI TEST CASE', description: 'Extension of the anonymizer testing card coverage.' } },
    async ({ anonymizerPage }) => {
      const email = createAnonymizerEmail('entity');
      const allowedEmail = createAnonymizerEmail('allowed');

      await anonymizerPage.open();
      await anonymizerPage.selectFirstDomain();

      await anonymizerPage.withSettingsRestored(async (settingsBefore) => {
        await test.step('The domain is set to replace e-mail addresses with one address allowed', async () => {
          await anonymizerPage.applySettings({
            ...settingsBefore,
            approach: 'Replace',
            entities: ['EMAIL_ADDRESS'],
            allowlist: [allowedEmail],
            denylist: [],
          });
          await anonymizerPage.saveSettings();
          await anonymizerPage.assertSaveWasConfirmed();
        });

        await test.step('The allowed address is kept and the other one is replaced', async () => {
          await anonymizerPage.anonymize(`Write to ${email} or to ${allowedEmail}.`);
          await anonymizerPage.assertOutputIs(`Write to [EMAIL_ADDRESS] or to ${allowedEmail}.`);
        });
      });
    },
  );

  test(
    'Denied word wins over the entity and the allowlist, only a whole word is hidden and in any case',
    { annotation: { type: 'NO KIWI TEST CASE', description: 'Extension of the anonymizer testing card coverage.' } },
    async ({ anonymizerPage }) => {
      const allowedEmail = createAnonymizerEmail('allowed');
      const allowedAndDeniedEmail = createAnonymizerEmail('both');
      const deniedWord = createAnonymizerWord('denied');
      const redacted = '[REDACTED]';

      await anonymizerPage.open();
      await anonymizerPage.selectFirstDomain();

      await anonymizerPage.withSettingsRestored(async (settingsBefore) => {
        await test.step('The domain allows two addresses and denies one of them and a word', async () => {
          await anonymizerPage.applySettings({
            ...settingsBefore,
            approach: 'Replace',
            entities: ['EMAIL_ADDRESS'],
            allowlist: [allowedEmail, allowedAndDeniedEmail],
            denylist: [allowedAndDeniedEmail, deniedWord],
          });
          await anonymizerPage.saveSettings();
          await anonymizerPage.assertSaveWasConfirmed();
        });

        await test.step('The output hides what is denied and keeps the rest', async () => {
          await anonymizerPage.anonymize(
            `a ${allowedEmail} b ${allowedAndDeniedEmail} c ${deniedWord} d ${deniedWord.toUpperCase()} e x${deniedWord} f`,
          );
          await anonymizerPage.assertOutputIs(
            `a ${allowedEmail} b ${redacted} c ${redacted} d ${redacted} e x${deniedWord} f`,
          );
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
});
