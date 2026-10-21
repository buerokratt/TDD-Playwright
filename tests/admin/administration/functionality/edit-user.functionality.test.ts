import { AdminPageFactory } from '@page-objects/admin-page-factory';
import { test } from '@setup/test-setup';
import { userCleanup } from '@utils/helpers';
import { createUpdatedUserData, createUserData } from '@utils/test-data';

const user = createUserData('autotestedituser');
const updated = createUpdatedUserData(user);

test.describe(
  '[administration] [functional] Editing a user replaces their details in the users table',
  { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/123/' } },
  () => {
    test.afterEach(userCleanup(() => user.personalCode));

    test('Saving a new name, display name and e-mail closes the dialog, confirms it and lists the updated values', async ({
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

      await test.step('Saving the new name, display name and e-mail closes the dialog', async () => {
        await up.fillEditUser(updated);
        await up.confirmEditUser();
        await up.assertEditUserDialogClosed();
      });

      await test.step('The back office confirms with "User updated"', async () => {
        await up.assertUserUpdatedConfirmed();
      });

      await test.step('The users table lists the user with the updated values', async () => {
        await up.assertUserListed(updated);
      });
    });
  },
);
