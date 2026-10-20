import { expect, test } from '@setup/test-setup';
import { domainCleanup } from '@utils/helpers';
import { createDomainName, createDomainUrl, createUpdatedDomainName } from '@utils/test-data';

const addedName = createDomainName('autotestadddomain');
const addedUrl = createDomainUrl(addedName);

const editedName = createDomainName('autotesteditdomain');
const editedUrl = createDomainUrl(editedName);
const updatedName = createUpdatedDomainName(editedName);
const updatedUrl = createDomainUrl(updatedName);

const deletedName = createDomainName('autotestdeletedomain');
const deletedUrl = createDomainUrl(deletedName);

test.describe('[administration] [functional] The domain left last cannot be removed', () => {
  test('Removing domains down to the last one disables its delete control', async ({ multiDomainsPage }) => {
    await multiDomainsPage.open();

    await test.step('The page opens with more than one domain listed', async () => {
      await multiDomainsPage.assertRowsAreComplete();

      if ((await multiDomainsPage.domainRowCount()) === 1) {
        await multiDomainsPage.addDomainRow();
      }
    });

    await test.step('Removing rows leaves a single domain in the form', async () => {
      await multiDomainsPage.removeDomainRowsUntilOneLeft();
    });

    await test.step('The remaining row offers no way to delete itself', async () => {
      await multiDomainsPage.assertOnlyDomainCannotBeDeleted();
    });
  });
});

test.describe('[administration] [functional] Domains are added, edited and deleted through the list', () => {
  test.afterEach(domainCleanup(() => [addedName, editedName, updatedName, deletedName]));

  test(
    'A saved domain is confirmed, listed and read back with the values entered',
    { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/153/' } },
    async ({ multiDomainsPage }) => {
      await multiDomainsPage.open();

      await test.step('The page lists the domains the stand already holds', async () => {
        await multiDomainsPage.assertRowsAreComplete();
      });

      await test.step('A new row takes a domain name and a URL', async () => {
        await multiDomainsPage.addDomainRow();
        await multiDomainsPage.fillLastDomainRow(addedName, addedUrl);
      });

      await test.step('Saving reports the update went through', async () => {
        await multiDomainsPage.saveDomains();
        await multiDomainsPage.assertSaveWasConfirmed();
      });

      await test.step('The domain survives a reload, its URL closed with the slash the back office adds', async () => {
        await multiDomainsPage.open();

        await multiDomainsPage.assertDomainStored(addedName, `${addedUrl}/`);
      });
    },
  );

  test(
    'An edited domain keeps its place and comes back with the new values',
    { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/152/' } },
    async ({ multiDomainsPage }) => {
      await multiDomainsPage.open();

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
      await multiDomainsPage.open();

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
});
