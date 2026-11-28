import { test } from '@setup/test-setup';
import { ADMIN_PERSONAL_CODE } from '@utils/constants';
import { readWidgetDomains } from '@utils/helpers';

test.describe('[administration] [visibility] The users page shows its users and the controls to manage them', () => {
  test(
    'The page lists every user with their controls and pages the list by the result count',
    { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/117/' } },
    async ({ usersPage }) => {
      await usersPage.open();

      await test.step('The page shows its heading and add control', async () => {
        await usersPage.assertHeadingAndAddUserShown();
      });

      await test.step('The table lists every column, each with a control to sort by it', async () => {
        await usersPage.assertTableListsEveryColumnWithSorting();
      });

      await test.step('Name, ID code, Role, Display Name, User title, E-mail and Department carry a filter control, and no other column does', async () => {
        await usersPage.assertFilterOfferedOnlyOnFilterableColumns();
      });

      await test.step('Every user row offers its status, Edit and Delete', async () => {
        await usersPage.assertEveryRowOffersStatusEditAndDelete();
      });

      await test.step('Delete is disabled on the row of the logged-in user and on no other row', async () => {
        await usersPage.assertDeleteDisabledOnlyOnOwnRow(ADMIN_PERSONAL_CODE);
      });

      await test.step('The result count offers 10, 20, 30, 40 and 50, and the list is paged once it overflows', async () => {
        await usersPage.assertPagingOfferedWhenListOverflows();
        await usersPage.assertResultCountOffered();
      });
    },
  );
});

test.describe('[administration] [visibility] The add user dialog asks for every detail of the new user', () => {
  test(
    'The dialog shows every field with its roles and domains to choose from and both its controls',
    { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/159/' } },
    async ({ page, usersPage }) => {
      const domainNames = (await readWidgetDomains(page)).map((domain) => domain.name);

      await usersPage.open();

      await test.step('The "Add user" dialog opens over the users page', async () => {
        await usersPage.openAddUserDialog();
        await usersPage.assertAddUserDialogIsShown();
      });

      await test.step('The dialog asks for the first- and lastname and the ID code, with the note on the country prefix', async () => {
        await usersPage.assertNameAndIdCodeAsked();
      });

      await test.step('"User role(s)" is a multiselect that starts on "Choose" and offers the five roles', async () => {
        await usersPage.assertRolesOffered();
      });

      await test.step('"Domains" is a multiselect that starts on "Choose" and offers every existing domain', async () => {
        await usersPage.assertDomainsOffered(domainNames);
      });

      await test.step('The dialog asks for the display name, the user title, the e-mail and the department', async () => {
        await usersPage.assertProfileFieldsAsked();
      });

      await test.step('The dialog offers "Cancel" and "Add user"', async () => {
        await usersPage.assertAddUserControlsOffered();
      });
    },
  );
});

test.describe('[administration] [visibility] The edit user dialog starts on the details the users table lists', () => {
  test(
    'The dialog shows every field filled in from the row, with only the roles and domains not yet chosen on offer',
    { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/160/' } },
    async ({ page, usersPage }) => {
      const domainNames = (await readWidgetDomains(page)).map((domain) => domain.name);

      await usersPage.open();

      const user = await usersPage.readUserRow(ADMIN_PERSONAL_CODE);

      await test.step('The "Edit user" dialog opens over the row of the logged-in user', async () => {
        await usersPage.openEditUserDialog(ADMIN_PERSONAL_CODE);
        await usersPage.assertEditUserDialogIsShown();
      });

      await test.step('The first- and lastname is filled in with the name the row lists', async () => {
        await usersPage.assertNameFilledIn(user);
      });

      await test.step('"User role(s)" holds the roles the row lists and offers only the roles not yet chosen', async () => {
        await usersPage.assertRolesOffered(user);
      });

      await test.step('"Domains" holds the domains the row lists and offers only the domains not yet chosen', async () => {
        await usersPage.assertDomainsOffered(domainNames, user);
      });

      await test.step('The display name, the user title, the e-mail and the department are filled in as the row lists them', async () => {
        await usersPage.assertProfileFieldsFilledIn(user);
      });

      await test.step('The dialog offers "Cancel" and "Edit user"', async () => {
        await usersPage.assertEditUserControlsOffered();
      });
    },
  );
});
