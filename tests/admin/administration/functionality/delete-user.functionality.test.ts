import { AdminPageFactory } from '@page-objects/admin-page-factory';
import { test } from '@setup/test-setup';
import { userCleanup } from '@utils/helpers';
import { createUserData } from '@utils/test-data';

const user = createUserData('autotestdeleteuser');

test.describe(
  '[administration] [functional] Deleting a user removes them from the users table',
  { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/124/' } },
  () => {
    test.afterEach(userCleanup(() => user.personalCode));

    test('Confirming the deletion is answered with "User deleted" and drops the row', async ({ page }) => {
      const up = new AdminPageFactory(page).getUsersPage();

      await up.open();

      await test.step('A user to delete is listed in the users table', async () => {
        await up.openAddUser();
        await up.fillAddUser(user);
        await up.confirmAddUser();
        await up.assertUserListed(user);
      });

      await test.step('Confirming "Yes" in the "Delete user" dialog is answered with "User deleted"', async () => {
        await up.openDeleteUser(user.personalCode);
        await up.confirmDeleteUser();
        await up.assertUserDeletedConfirmed();
      });

      await test.step('The users table no longer lists the deleted user', async () => {
        await up.assertUserNotListed(user.name);
      });
    });
  },
);
