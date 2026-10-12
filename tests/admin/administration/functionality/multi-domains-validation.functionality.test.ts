import { expect, test } from '@setup/test-setup';
import {
  DOMAIN_FIELD_MAX_LENGTH,
  DUPLICATE_DOMAIN_NAME_MESSAGE,
  DUPLICATE_DOMAIN_URL_MESSAGE,
  INVALID_DOMAIN_URLS,
  OVERLONG_DOMAIN_LENGTH,
} from '@utils/constants';
import { domainCleanup, readStoredDomains } from '@utils/helpers';
import { WidgetDomain } from '@utils/interfaces';
import { createDomainName, createDomainUrl } from '@utils/test-data';

let domainsBeforeRun: WidgetDomain[];

test.beforeEach(async ({ page, multiDomainsPage }) => {
  domainsBeforeRun = await readStoredDomains(page);

  await multiDomainsPage.open();
  await multiDomainsPage.assertRowsAreComplete();
});

test.afterEach(async ({ page, multiDomainsPage }) => {
  const addedNames = (await readStoredDomains(page))
    .filter((domain) => !domainsBeforeRun.some((original) => original.domainId === domain.domainId))
    .map((domain) => domain.name);

  await domainCleanup(addedNames)({ multiDomainsPage });

  if (addedNames.includes('')) {
    await multiDomainsPage.open();
    await multiDomainsPage.deleteDomainByName('');
    await multiDomainsPage.saveDomains();
    await multiDomainsPage.assertSaveWasConfirmed();
  }

  expect(await readStoredDomains(page), 'The stand no longer holds exactly the domains it ran on').toEqual(
    domainsBeforeRun,
  );
});

test.describe('[administration] [functional] Domain names and URLs are checked before they are stored', () => {
  test('Empty name and empty URL are refused', async ({ multiDomainsPage }) => {
    await test.step('A row left empty is refused and nothing is posted', async () => {
      await multiDomainsPage.addDomainRow();

      await multiDomainsPage.assertSaveRefused('A domain with an empty name and URL was sent to be stored');
    });

    await test.step('A named row with an empty URL is refused and nothing is posted', async () => {
      await multiDomainsPage.open();
      await multiDomainsPage.addDomainRow();
      await multiDomainsPage.fillLastDomainRow(createDomainName('autotestemptyurl'), '');

      await multiDomainsPage.assertSaveRefused('A domain with an empty URL was sent to be stored');
    });
  });

  test('Invalid URL formats are refused', async ({ multiDomainsPage }) => {
    for (const invalidUrl of INVALID_DOMAIN_URLS) {
      await test.step(`"${invalidUrl}" is refused and nothing is posted`, async () => {
        await multiDomainsPage.open();
        await multiDomainsPage.addDomainRow();
        await multiDomainsPage.fillLastDomainRow(createDomainName('autotestinvalidurl'), invalidUrl);

        await multiDomainsPage.assertSaveRefused(`A domain with the URL "${invalidUrl}" was sent to be stored`);
      });
    }
  });

  test('A duplicate domain name is refused case-insensitively', async ({ multiDomainsPage }) => {
    const clashing = domainsBeforeRun[0];

    for (const duplicateName of [clashing.name, clashing.name.toUpperCase()]) {
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

  test('A duplicate URL is refused regardless of case and trailing slash', async ({ multiDomainsPage }) => {
    const clashing = domainsBeforeRun[0];
    const duplicateUrls = [clashing.url.replace(/\/$/, ''), clashing.url.toUpperCase(), clashing.url];

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

    await test.step('Two new rows with the same name and URL are both marked and nothing is posted', async () => {
      const name = createDomainName('autotestduprows');
      const url = createDomainUrl(name);

      await multiDomainsPage.open();
      await multiDomainsPage.addDomainRow();
      await multiDomainsPage.fillLastDomainRow(name, url);
      await multiDomainsPage.addDomainRow();
      await multiDomainsPage.fillLastDomainRow(name, url);

      await multiDomainsPage.assertNothingSaved(async () => {
        await multiDomainsPage.saveDomains();
        await multiDomainsPage.assertDuplicateMarked(DUPLICATE_DOMAIN_NAME_MESSAGE, 'name', name);
        await multiDomainsPage.assertDuplicateMarked(DUPLICATE_DOMAIN_URL_MESSAGE, 'name', name);
      }, 'A refused duplicate was sent to be stored');
    });

    await test.step('The stand keeps the domains it ran on after a reload', async () => {
      await multiDomainsPage.open();
      await multiDomainsPage.assertDomainsStored(domainsBeforeRun);
    });
  });

  test('Duplicate messages show only on Save and the stale one stays after the fix', async ({ multiDomainsPage }) => {
    const clashing = domainsBeforeRun[0];
    const fixedName = createDomainName('autotestfixedname');
    const url = createDomainUrl(fixedName);

    await test.step('A name already listed is typed and no message is shown before Save', async () => {
      await multiDomainsPage.addDomainRow();
      await multiDomainsPage.fillLastDomainRow(clashing.name, url);

      await multiDomainsPage.assertDuplicateNotMarked(DUPLICATE_DOMAIN_NAME_MESSAGE);
    });

    await test.step('Saving marks both clashing rows and posts nothing', async () => {
      await multiDomainsPage.assertNothingSaved(async () => {
        await multiDomainsPage.saveDomains();
        await multiDomainsPage.assertDuplicateMarked(DUPLICATE_DOMAIN_NAME_MESSAGE, 'url', url);
        await multiDomainsPage.assertDuplicateMarked(DUPLICATE_DOMAIN_NAME_MESSAGE, 'url', clashing.url);
      }, 'A refused duplicate was sent to be stored');
    });

    await test.step('A unique name clears the message under the new row', async () => {
      await multiDomainsPage.fillLastDomainRow(fixedName, url);

      await multiDomainsPage.assertDuplicateNotMarked(DUPLICATE_DOMAIN_NAME_MESSAGE, 'url', url);
    });

    await test.step('The original row keeps its stale message', async () => {
      await multiDomainsPage.assertDuplicateMarked(DUPLICATE_DOMAIN_NAME_MESSAGE, 'url', clashing.url);
    });

    await test.step('Reloading without saving leaves the stand with the domains it ran on', async () => {
      await multiDomainsPage.open();
      await multiDomainsPage.assertDomainsStored(domainsBeforeRun);
    });
  });

  test('URL is trimmed and closed with one slash, the name is posted as typed', async ({ multiDomainsPage }) => {
    const paddedName = `  ${createDomainName('autotestws')}  `;
    const trimmedUrl = createDomainUrl(paddedName.trim());
    const slashName = createDomainName('autotestslash');
    const slashUrl = `${createDomainUrl(slashName)}/`;

    await test.step('Padded values are posted with the URL trimmed and closed with a slash and the name as typed', async () => {
      await multiDomainsPage.addDomainRow();
      await multiDomainsPage.fillLastDomainRow(paddedName, `  ${trimmedUrl}  `);

      expect(
        await multiDomainsPage.saveReadingPostedDomains(),
        'The padded domain was posted with different values',
      ).toEqual([expect.objectContaining({ name: paddedName, url: `${trimmedUrl}/`, active: true })]);
    });

    await test.step('Saving the padded values reports the update went through', async () => {
      await multiDomainsPage.assertSaveWasConfirmed();
    });

    await test.step('A URL already closed with a slash is saved', async () => {
      await multiDomainsPage.open();
      await multiDomainsPage.addDomainRow();
      await multiDomainsPage.fillLastDomainRow(slashName, slashUrl);
      await multiDomainsPage.saveDomains();
      await multiDomainsPage.assertSaveWasConfirmed();
    });

    await test.step('It is read back without a second slash', async () => {
      await multiDomainsPage.open();
      await multiDomainsPage.assertDomainStored(slashName, slashUrl);
    });
  });

  test('Very long name and URL are cut to 3000 characters in the form', async ({ multiDomainsPage }) => {
    const prefix = createDomainName('autotestlong');
    const longName = prefix.padEnd(OVERLONG_DOMAIN_LENGTH, 'n');
    const longUrl = createDomainUrl(prefix).padEnd(OVERLONG_DOMAIN_LENGTH, 'u');
    const cutName = longName.slice(0, DOMAIN_FIELD_MAX_LENGTH);
    const cutUrl = longUrl.slice(0, DOMAIN_FIELD_MAX_LENGTH);

    await test.step('Both fields stop taking characters at 3000', async () => {
      await multiDomainsPage.addDomainRow();
      await multiDomainsPage.fillLastDomainRow(longName, longUrl);

      await multiDomainsPage.assertLastRowHolds(cutName, cutUrl);
    });

    await test.step('Saving the cut values reports the update went through', async () => {
      await multiDomainsPage.saveDomains();
      await multiDomainsPage.assertSaveWasConfirmed();
    });

    await test.step('The cut values are read back, the URL closed with the slash the back office adds', async () => {
      await multiDomainsPage.open();
      await multiDomainsPage.assertDomainStored(cutName, `${cutUrl}/`);
    });
  });
});
