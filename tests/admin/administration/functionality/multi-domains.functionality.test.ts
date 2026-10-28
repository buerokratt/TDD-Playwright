import { expect, test } from '@setup/test-setup';
import {
  DUPLICATE_DOMAIN_NAME_MESSAGE,
  DUPLICATE_DOMAIN_URL_MESSAGE,
  REQUIRED_DOMAIN_NAME_MESSAGE,
  REQUIRED_DOMAIN_URL_MESSAGE,
} from '@utils/constants';
import { multiDomainsCleanup, readWidgetDomains } from '@utils/helpers';
import { WidgetDomain } from '@utils/interfaces';
import { createDomainName, createDomainUrl, createUpdatedDomainName } from '@utils/test-data';

let domainsBeforeRun: WidgetDomain[];

test.beforeEach(async ({ page, multiDomainsPage }) => {
  await multiDomainsPage.open();
  await multiDomainsPage.assertRowsAreComplete();

  domainsBeforeRun = await readWidgetDomains(page);
});

test.afterEach(async ({ page }) => {
  await multiDomainsCleanup(() => domainsBeforeRun)({ page });

  expect(
    await readWidgetDomains(page),
    'After cleanup, the widget domains differ from the ones this run started with',
  ).toEqual(domainsBeforeRun);
});

test.describe('[administration] [functional] Domain list changes are saved for the stand', () => {
  test(
    'Saved domains are confirmed and read back, each URL trimmed and closed with one slash',
    { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/153/' } },
    async ({ multiDomainsPage }) => {
      const addedName = createDomainName('autotestadddomain');
      const addedUrl = createDomainUrl(addedName);
      const paddedName = createDomainName('autotestpaddomain');
      const paddedUrl = createDomainUrl(paddedName);

      await test.step('New domain is added: its name and URL typed as-is, the URL not ending with a slash', async () => {
        await multiDomainsPage.addDomainRow();
        await multiDomainsPage.fillLastDomainRow(addedName, addedUrl);
      });

      await test.step('New domain is added: its name and URL wrapped in spaces, the URL already ending with a slash', async () => {
        await multiDomainsPage.addDomainRow();
        await multiDomainsPage.fillLastDomainRow(`  ${paddedName}  `, `  ${paddedUrl}/  `);
      });

      await test.step('Saving reports the update went through', async () => {
        await multiDomainsPage.saveDomains();
        await multiDomainsPage.assertSaveWasConfirmed();
      });

      await test.step('The page is reloaded', async () => {
        await multiDomainsPage.open();
      });

      await test.step('Saved domain typed as-is: name unchanged, URL ending with a slash', async () => {
        await multiDomainsPage.assertDomainStored(addedName, `${addedUrl}/`);
      });

      await test.step('Saved domain wrapped in spaces: spaces kept on the name, URL trimmed and ending with one slash', async () => {
        await multiDomainsPage.assertDomainStored(`  ${paddedName}  `, `${paddedUrl}/`);
      });
    },
  );

  test(
    'An edited domain keeps its place and comes back with the new values',
    { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/152/' } },
    async ({ multiDomainsPage }) => {
      const editedName = createDomainName('autotesteditdomain');
      const editedUrl = createDomainUrl(editedName);
      const updatedName = createUpdatedDomainName(editedName);
      const updatedUrl = createDomainUrl(updatedName);

      await test.step("A domain of the run's own is on the list to edit", async () => {
        await multiDomainsPage.addDomainRow();
        await multiDomainsPage.fillLastDomainRow(editedName, editedUrl);
        await multiDomainsPage.saveDomains();
        await multiDomainsPage.assertSaveWasConfirmed();

        await multiDomainsPage.open();
      });

      await test.step('Its name and URL are replaced with new values', async () => {
        await multiDomainsPage.updateDomainByName(editedName, updatedName, updatedUrl);
      });

      await test.step('Saving reports the update went through', async () => {
        await multiDomainsPage.saveDomains();
        await multiDomainsPage.assertSaveWasConfirmed();
      });

      await test.step('The list holds the changed domain and not the one it replaced', async () => {
        await multiDomainsPage.open();

        await multiDomainsPage.assertDomainListedOnce(updatedName);
        await multiDomainsPage.assertDomainNotListed(editedName);
      });

      await test.step('The new values survive the reload, the URL closed with the slash the back office adds', async () => {
        await multiDomainsPage.assertDomainStored(updatedName, `${updatedUrl}/`);
      });
    },
  );

  test(
    'A deleted domain is gone from the list after a reload',
    { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/154/' } },
    async ({ multiDomainsPage }) => {
      const deletedName = createDomainName('autotestdeletedomain');
      const deletedUrl = createDomainUrl(deletedName);

      await test.step("A domain of the run's own is on the list to delete", async () => {
        await multiDomainsPage.addDomainRow();
        await multiDomainsPage.fillLastDomainRow(deletedName, deletedUrl);
        await multiDomainsPage.saveDomains();
        await multiDomainsPage.assertSaveWasConfirmed();

        await multiDomainsPage.open();
      });

      await test.step('The list holds more than one domain', async () => {
        expect(
          await multiDomainsPage.domainRowCount(),
          'Deleting is only offered where a second domain remains',
        ).toBeGreaterThan(1);
      });

      await test.step('Its row is taken out of the form', async () => {
        await multiDomainsPage.deleteDomainByName(deletedName);
      });

      await test.step('Saving reports the update went through', async () => {
        await multiDomainsPage.saveDomains();
        await multiDomainsPage.assertSaveWasConfirmed();
      });

      await test.step('The domain is gone from the list after a reload', async () => {
        await multiDomainsPage.open();

        await multiDomainsPage.assertDomainNotListed(deletedName);
      });
    },
  );

  test(
    'Saving without a change keeps the stored domains',
    { annotation: { type: 'NO KIWI TEST CASE', description: 'Extension of the domain list save coverage.' } },
    async ({ multiDomainsPage }) => {
      await test.step('Saving the untouched list reports the change went through', async () => {
        await multiDomainsPage.saveDomains();
        await multiDomainsPage.assertSaveWasConfirmed();
      });

      await test.step('The domains come back unchanged after a reload', async () => {
        await multiDomainsPage.open();

        await multiDomainsPage.assertDomainsStored(domainsBeforeRun);
      });
    },
  );
});

test.describe('[administration] [functional] The domain left last cannot be removed', () => {
  test(
    'Removing domains down to the last one disables its delete control',
    { annotation: { type: 'NO KIWI TEST CASE', description: 'Extension of the domain deletion coverage.' } },
    async ({ multiDomainsPage }) => {
      await test.step('Removing rows leaves a single domain in the form', async () => {
        await multiDomainsPage.removeDomainRowsUntilOneLeft();
      });

      await test.step('The remaining row offers no way to delete itself', async () => {
        await multiDomainsPage.assertOnlyDomainCannotBeDeleted();
      });
    },
  );
});

test.describe(
  '[administration] [functional] Empty and duplicate values are refused, nothing is stored',
  { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/210/' } },
  () => {
    test('Empty domain name and URL are refused', async ({ multiDomainsPage }) => {
      const emptyRows = [
        {
          label: 'Both fields empty',
          name: '',
          url: '',
          messages: [REQUIRED_DOMAIN_NAME_MESSAGE, REQUIRED_DOMAIN_URL_MESSAGE],
        },
        {
          label: 'Only the name empty',
          name: '',
          url: createDomainUrl(createDomainName('autotestemptyname')),
          messages: [REQUIRED_DOMAIN_NAME_MESSAGE],
        },
        {
          label: 'Only the URL empty',
          name: createDomainName('autotestemptyurl'),
          url: '',
          messages: [REQUIRED_DOMAIN_URL_MESSAGE],
        },
        {
          label: 'Both fields only spaces',
          name: '   ',
          url: '   ',
          messages: [REQUIRED_DOMAIN_NAME_MESSAGE, REQUIRED_DOMAIN_URL_MESSAGE],
        },
      ];

      for (const { label, name, url, messages } of emptyRows) {
        await test.step(`${label}: the new row is marked as required and nothing is posted`, async () => {
          await multiDomainsPage.open();
          await multiDomainsPage.addDomainRow();
          await multiDomainsPage.fillLastDomainRow(name, url);

          await multiDomainsPage.assertNothingSaved(async () => {
            await multiDomainsPage.saveDomains();

            for (const message of messages) {
              await multiDomainsPage.assertLastRowMarked(message);
            }
          }, 'A row with an empty value was sent to be stored');
        });
      }

      await test.step('The stand keeps the domains it ran on after a reload', async () => {
        await multiDomainsPage.open();
        await multiDomainsPage.assertDomainsStored(domainsBeforeRun);
      });
    });

    test('Duplicate domain name is refused', async ({ multiDomainsPage }) => {
      const clashing = domainsBeforeRun[0];

      for (const duplicateName of [clashing.name, `  ${clashing.name.toUpperCase()}  `]) {
        await test.step(`"${duplicateName}" is marked under both clashing rows and nothing is posted`, async () => {
          const url = createDomainUrl(createDomainName('autotestdupname'));

          await multiDomainsPage.open();
          await multiDomainsPage.addDomainRow();
          await multiDomainsPage.fillLastDomainRow(duplicateName, url);

          await multiDomainsPage.assertNothingSaved(async () => {
            await multiDomainsPage.saveDomains();
            await multiDomainsPage.assertDuplicateMarked(DUPLICATE_DOMAIN_NAME_MESSAGE, 'url', url);
            await multiDomainsPage.assertDuplicateMarked(DUPLICATE_DOMAIN_NAME_MESSAGE, 'url', clashing.url);
          }, 'A refused duplicate was sent to be stored');
        });
      }

      await test.step('The stand keeps the domains it ran on after a reload', async () => {
        await multiDomainsPage.open();
        await multiDomainsPage.assertDomainsStored(domainsBeforeRun);
      });
    });

    test('Duplicate URL is refused', async ({ multiDomainsPage }) => {
      const clashing = domainsBeforeRun[0];
      const duplicateUrls = [clashing.url, `  ${clashing.url.toUpperCase()}  `, clashing.url.replace(/\/$/, '')];

      for (const duplicateUrl of duplicateUrls) {
        await test.step(`"${duplicateUrl}" is marked under both clashing rows and nothing is posted`, async () => {
          const name = createDomainName('autotestdupurl');

          await multiDomainsPage.open();
          await multiDomainsPage.addDomainRow();
          await multiDomainsPage.fillLastDomainRow(name, duplicateUrl);

          await multiDomainsPage.assertNothingSaved(async () => {
            await multiDomainsPage.saveDomains();
            await multiDomainsPage.assertDuplicateMarked(DUPLICATE_DOMAIN_URL_MESSAGE, 'name', name);
            await multiDomainsPage.assertDuplicateMarked(DUPLICATE_DOMAIN_URL_MESSAGE, 'name', clashing.name);
          }, 'A refused duplicate was sent to be stored');
        });
      }

      await test.step('The stand keeps the domains it ran on after a reload', async () => {
        await multiDomainsPage.open();
        await multiDomainsPage.assertDomainsStored(domainsBeforeRun);
      });
    });
  },
);
