import { AdminPageFactory } from '@page-objects/admin-page-factory';
import { test } from '@setup/test-setup';
import { ADMIN_PERSONAL_CODE, USERS_TABLE_RESULT_COUNTS } from '@utils/constants';
import { existingDomainNames, usersPageSizeCleanup } from '@utils/helpers';

test.describe(
  '[administration] [visibility] The users page shows its users and the controls to manage them',
  { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/117/' } },
  () => {
    let pageSizeBeforeRun: string | undefined;

    test.afterEach(usersPageSizeCleanup(() => pageSizeBeforeRun));

    test('The page lists every user with their controls and pages the list by the result count', async ({ page }) => {
      const up = new AdminPageFactory(page).getUsersPage();

      await up.open();

      await test.step('The page shows its "Users" heading and a way to add a user', async () => {
        await up.assertHeadingAndAddUserShown();
      });

      await test.step('The table lists every column the case names, each with a control to sort by it', async () => {
        await up.assertTableListsEveryColumnWithSorting();
      });

      await test.step('Name, ID code, Role, Display Name, User title, E-mail and Department carry a filter control, and no other column does', async () => {
        await up.assertFilterOfferedOnlyOnFilterableColumns();
      });

      await test.step('Every user row offers its status, Edit and Delete', async () => {
        await up.assertEveryRowOffersStatusEditAndDelete();
      });

      await test.step('Delete is disabled only on the row of the logged-in user', async () => {
        await up.assertDeleteDisabledOnlyOnOwnRow(ADMIN_PERSONAL_CODE);
      });

      await test.step('The result count offers 10, 20, 30, 40 and 50', async () => {
        await up.assertResultCountOffered();
      });

      await test.step('The list is paged once it overflows the result count', async () => {
        pageSizeBeforeRun = await up.readPageSize();
        await up.setPageSize(USERS_TABLE_RESULT_COUNTS[0]);
        await up.assertPagingOfferedWhenListOverflows();
      });
    });
  },
);

test.describe(
  '[administration] [visibility] The add user dialog asks for every detail of the new user',
  { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/159/' } },
  () => {
    test('The dialog shows every field with its roles and domains to choose from and both its controls', async ({
      page,
    }) => {
      const up = new AdminPageFactory(page).getUsersPage();
      const domainNames = await existingDomainNames(page);

      await up.open();

      await test.step('The "Add user" dialog opens over the users page', async () => {
        await up.openAddUser();
        await up.assertAddUserDialogIsShown();
      });

      await test.step('The dialog asks for the first- and lastname and the ID code, with the note on the country prefix', async () => {
        await up.assertNameAndIdCodeAsked();
      });

      await test.step('"User role(s)" is a multiselect that starts on "Choose" and offers the five roles', async () => {
        await up.assertRolesOffered();
      });

      await test.step('"Domains" is a multiselect that starts on "Choose" and offers every existing domain', async () => {
        await up.assertDomainsOffered(domainNames);
      });

      await test.step('The dialog asks for the display name, the user title, the e-mail and the department', async () => {
        await up.assertProfileFieldsAsked();
      });

      await test.step('The dialog offers "Cancel" and "Add user"', async () => {
        await up.assertAddUserControlsOffered();
      });
    });
  },
);

test.describe(
  '[administration] [visibility] The edit user dialog starts on the details the users table lists',
  { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/160/' } },
  () => {
    test('The dialog shows every field filled in from the row, with only the roles and domains not yet chosen on offer', async ({
      page,
    }) => {
      const up = new AdminPageFactory(page).getUsersPage();
      const domainNames = await existingDomainNames(page);

      await up.open();

      const user = await up.readUserRow(ADMIN_PERSONAL_CODE);

      await test.step('The "Edit user" dialog opens over the row of the logged-in user', async () => {
        await up.openEditUser(ADMIN_PERSONAL_CODE);
        await up.assertEditUserDialogIsShown();
      });

      await test.step('The first- and lastname is filled in with the name the row lists', async () => {
        await up.assertNameFilledIn(user);
      });

      await test.step('"User role(s)" holds the roles the row lists and offers only the roles not yet chosen', async () => {
        await up.assertUserRolesHeld(user);
      });

      await test.step('"Domains" holds the domains the row lists and offers only the domains not yet chosen', async () => {
        await up.assertUserDomainsHeld(user, domainNames);
      });

      await test.step('The display name, the user title, the e-mail and the department are filled in as the row lists them', async () => {
        await up.assertProfileFilledIn(user);
      });

      await test.step('The dialog offers "Cancel" and "Edit user"', async () => {
        await up.assertEditUserControlsOffered();
      });
    });
  },
);
