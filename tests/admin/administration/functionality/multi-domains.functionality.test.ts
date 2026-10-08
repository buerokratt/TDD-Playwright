import { AdminPageFactory } from '@page-objects/admin-page-factory';
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
  test('Removing domains down to the last one disables its delete control', async ({ page }) => {
    const mdp = new AdminPageFactory(page).getMultiDomainsPage();

    await mdp.open();

    await test.step('The page opens with more than one domain listed', async () => {
      await mdp.assertRowsAreComplete();

      if ((await mdp.domainRowCount()) === 1) {
        await mdp.addDomainRow();
      }
    });

    await test.step('Removing rows leaves a single domain in the form', async () => {
      await mdp.removeDomainRowsUntilOneLeft();
    });

    await test.step('The remaining row offers no way to delete itself', async () => {
      await mdp.assertOnlyDomainCannotBeDeleted();
    });
  });
});

test.describe('[administration] [functional] Domains are added, edited and deleted through the list', () => {
  test.afterEach(domainCleanup(() => [addedName, editedName, updatedName, deletedName]));

  test(
    'A saved domain is confirmed, listed and read back with the values entered',
    { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/153/' } },
    async ({ page }) => {
      const mdp = new AdminPageFactory(page).getMultiDomainsPage();

      await mdp.open();

      await test.step('The page lists the domains the stand already holds', async () => {
        await mdp.assertRowsAreComplete();
      });

      await test.step('A new row takes a domain name and a URL', async () => {
        await mdp.addDomainRow();
        await mdp.fillLastDomainRow(addedName, addedUrl);
      });

      await test.step('Saving reports the update went through', async () => {
        await mdp.saveDomains();
        await mdp.assertSaveWasConfirmed();
      });

      await test.step('The domain survives a reload, its URL closed with the slash the back office adds', async () => {
        await mdp.open();

        await mdp.assertDomainStored(addedName, `${addedUrl}/`);
      });
    },
  );

  test(
    'An edited domain keeps its place and comes back with the new values',
    { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/152/' } },
    async ({ page }) => {
      const mdp = new AdminPageFactory(page).getMultiDomainsPage();

      await mdp.open();

      await test.step("A domain of the run's own is on the list to edit", async () => {
        await mdp.addDomainRow();
        await mdp.fillLastDomainRow(editedName, editedUrl);
        await mdp.saveDomains();
        await mdp.assertSaveWasConfirmed();

        await mdp.open();
      });

      await test.step('Its name and URL are replaced with new values', async () => {
        await mdp.updateDomainByName(editedName, updatedName, updatedUrl);
      });

      await test.step('Saving reports the update went through', async () => {
        await mdp.saveDomains();
        await mdp.assertSaveWasConfirmed();
      });

      await test.step('The list holds the changed domain and not the one it replaced', async () => {
        await mdp.open();

        await mdp.assertDomainListedOnce(updatedName);
        await mdp.assertDomainNotListed(editedName);
      });

      await test.step('The new values survive the reload, the URL closed with the slash the back office adds', async () => {
        await mdp.assertDomainStored(updatedName, `${updatedUrl}/`);
      });
    },
  );

  test(
    'A deleted domain is gone from the list after a reload',
    { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/154/' } },
    async ({ page }) => {
      const mdp = new AdminPageFactory(page).getMultiDomainsPage();

      await mdp.open();

      await test.step("A domain of the run's own is on the list to delete", async () => {
        await mdp.addDomainRow();
        await mdp.fillLastDomainRow(deletedName, deletedUrl);
        await mdp.saveDomains();
        await mdp.assertSaveWasConfirmed();

        await mdp.open();
      });

      await test.step('The list holds more than one domain', async () => {
        expect(await mdp.domainRowCount(), 'Deleting is only offered where a second domain remains').toBeGreaterThan(1);
      });

      await test.step('Its row is taken out of the form', async () => {
        await mdp.deleteDomainByName(deletedName);
      });

      await test.step('Saving reports the update went through', async () => {
        await mdp.saveDomains();
        await mdp.assertSaveWasConfirmed();
      });

      await test.step('The domain is gone from the list after a reload', async () => {
        await mdp.open();

        await mdp.assertDomainNotListed(deletedName);
      });
    },
  );
});
