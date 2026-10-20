import { AdminPageFactory } from '@page-objects/admin-page-factory';
import { test } from '@setup/test-setup';
import { userCleanup } from '@utils/helpers';
import { createUserData } from '@utils/test-data';

const user = createUserData();

test.describe(
  '[administration] [functional] A user added through the dialog joins the users table',
  { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/118/' } },
  () => {
    test.afterEach(userCleanup(() => user.personalCode));

    test('Adding a user with valid values closes the dialog, confirms it and lists the user as busy', async ({
      page,
    }) => {
      const up = new AdminPageFactory(page).getUsersPage();

      await up.open();

      await test.step('The "Add user" dialog opens over the users page', async () => {
        await up.openAddUser();
        await up.assertAddUserDialogIsShown();
      });

      await test.step('Adding the user with every field the case names filled in closes the dialog', async () => {
        await up.fillAddUser(user);
        await up.confirmAddUser();
        await up.assertAddUserDialogClosed();
      });

      await test.step('The back office confirms with "New user added"', async () => {
        await up.assertUserAddedConfirmed();
      });

      await test.step('The users table lists the new user with the entered values', async () => {
        await up.assertUserListed(user);
      });

      await test.step('The new user is shown as "Busy"', async () => {
        await up.assertUserBusy(user.personalCode);
      });
    });
  },
);
