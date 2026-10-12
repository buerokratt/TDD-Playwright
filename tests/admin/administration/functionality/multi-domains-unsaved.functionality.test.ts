import { test } from '@setup/test-setup';
import { readStoredDomains } from '@utils/helpers';
import { WidgetDomain } from '@utils/interfaces';
import { createDomainName, createDomainUrl } from '@utils/test-data';

const unsavedName = createDomainName('autotestunsaveddomain');
const unsavedUrl = createDomainUrl(unsavedName);

let domainsBeforeRun: WidgetDomain[];

test.beforeEach(async ({ page, multiDomainsPage }) => {
  domainsBeforeRun = await readStoredDomains(page);

  await multiDomainsPage.open();
});

test.describe('[administration] [functional] An unsaved domain change is dropped once the page is left', () => {
  test('Leaving through the side menu drops an added row without a prompt', async ({
    multiDomainsPage,
    sessionLengthPage,
    sideMenu,
  }) => {
    await test.step('A new row takes a domain name and a URL and is left unsaved', async () => {
      await multiDomainsPage.addDomainRow();
      await multiDomainsPage.fillLastDomainRow(unsavedName, unsavedUrl);
      await multiDomainsPage.assertLastRowHolds(unsavedName, unsavedUrl);
    });

    await test.step('Leaving through the side menu raises no prompt', async () => {
      await multiDomainsPage.assertLeavingRaisesNoPrompt(() => sideMenu.openSessionLength());
    });

    await test.step('Session length opens from the side menu', async () => {
      await sessionLengthPage.assertPageIsShown();
    });

    await test.step('Multi-domains opens again from the side menu', async () => {
      await sideMenu.openMultiDomains();
      await multiDomainsPage.waitForReady();
      await multiDomainsPage.assertRowsAreComplete();
    });

    await test.step('The unsaved row is gone', async () => {
      await multiDomainsPage.assertDomainNotListed(unsavedName);
    });

    await test.step('The stored domains are listed unchanged', async () => {
      await multiDomainsPage.assertDomainsStored(domainsBeforeRun);
    });
  });

  test('Reloading drops an added or a deleted row without a prompt', async ({ multiDomainsPage }) => {
    await test.step('A new row takes a domain name and a URL and is left unsaved', async () => {
      await multiDomainsPage.addDomainRow();
      await multiDomainsPage.fillLastDomainRow(unsavedName, unsavedUrl);
    });

    await test.step('The page reloads without a prompt', async () => {
      await multiDomainsPage.assertLeavingRaisesNoPrompt(() => multiDomainsPage.open());
    });

    await test.step('The reloaded page holds no unsaved row', async () => {
      await multiDomainsPage.assertDomainNotListed(unsavedName);
    });

    await test.step('A stored domain is taken out of the form and left unsaved', async () => {
      await multiDomainsPage.deleteDomainByName(domainsBeforeRun[domainsBeforeRun.length - 1].name);
    });

    await test.step('The page reloads again without a prompt', async () => {
      await multiDomainsPage.assertLeavingRaisesNoPrompt(() => multiDomainsPage.open());
    });

    await test.step('The reloaded page brings back every stored domain', async () => {
      await multiDomainsPage.assertDomainsStored(domainsBeforeRun);
    });
  });
});
