import { AdminPageFactory } from '@page-objects/admin-page-factory';
import { test } from '@setup/test-setup';
import { EDIT_USER_REQUIRED_FIELDS } from '@utils/constants';
import { userCleanup } from '@utils/helpers';
import { createUserData } from '@utils/test-data';

const user = createUserData('autotestinvalidedituser');

test.describe(
  '[administration] [functional] The edit user dialog rejects missing and invalid details',
  { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/162/' } },
  () => {
    test.afterEach(userCleanup(() => user.personalCode));

    test('Emptied required fields and a malformed e-mail are rejected and leave the user unchanged', async ({
      page,
    }) => {
      const up = new AdminPageFactory(page).getUsersPage();

      await up.open();

      await test.step('A user to edit is listed in the users table', async () => {
        await up.openAddUser();
        await up.fillAddUser(user);
        await up.confirmAddUser();
        await up.assertUserListed(user);
      });

      await test.step('The "Edit user" dialog opens over the row of the new user', async () => {
        await up.openEditUser(user.personalCode);
        await up.assertEditUserDialogIsShown();
      });

      await test.step('First- and lastname, User role(s), Display Name and E-mail are flagged "Required" when emptied', async () => {
        await up.clearEditUser(user);
        await up.confirmEditUser();
        await up.assertRequiredFieldsFlagged(EDIT_USER_REQUIRED_FIELDS);
      });

      await test.step('A malformed e-mail is rejected as "Invalid email"', async () => {
        await up.fillEditUser(user);
        await up.selectEditUserRoles(user.roles);
        await up.fillEmail('not-an-email');
        await up.confirmEditUser();
        await up.assertFieldRejected('E-mail', 'Invalid email');
      });

      await test.step('The "Edit user" dialog stays open after every rejected attempt', async () => {
        await up.assertEditUserDialogIsShown();
      });

      await test.step('The users table still lists the user with their original values', async () => {
        await up.open();
        await up.assertUserListed(user);
      });
    });
  },
);
