import { test } from '@setup/test-setup';
import {
  ADMIN_PERSONAL_CODE,
  INVALID_USER_EMAIL_MESSAGE,
  INVALID_USER_ID_CODE_MESSAGE,
  USER_REQUIRED_FIELDS,
} from '@utils/constants';
import { userCleanup } from '@utils/helpers';
import { createUpdatedUserData, createUserData } from '@utils/test-data';

test.describe('[administration] [functional] A user added through the dialog joins the users table', () => {
  const addedUser = createUserData();

  test.afterEach(userCleanup(() => addedUser.personalCode));

  test(
    'Adding a user with valid values closes the dialog, confirms it and lists the user as busy',
    { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/118/' } },
    async ({ usersPage }) => {
      await usersPage.open();

      await test.step('The "Add user" dialog opens over the users page', async () => {
        await usersPage.openAddUserDialog();
        await usersPage.assertAddUserDialogIsShown();
      });

      await test.step('Adding the user with every required field filled in closes the dialog', async () => {
        await usersPage.fillAddUserDialog(addedUser);
        await usersPage.confirmAddUser();
        await usersPage.assertAddUserDialogClosed();
      });

      await test.step('The back office confirms with "New user added"', async () => {
        await usersPage.assertUserAddedConfirmed();
      });

      await test.step('The users table lists the new user with the entered values', async () => {
        await usersPage.assertUserListed(addedUser);
      });

      await test.step('The new user is shown as "Busy"', async () => {
        await usersPage.assertUserBusy(addedUser.personalCode);
      });
    },
  );
});

test.describe('[administration] [functional] The add user dialog rejects missing and invalid details', () => {
  const rejectedUser = createUserData('autotestinvaliduser');

  test.afterEach(userCleanup(() => rejectedUser.personalCode));

  test(
    'Empty fields, a malformed or taken ID code and a malformed e-mail are rejected and add no user',
    { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/121/' } },
    async ({ usersPage }) => {
      await usersPage.open();

      await test.step('The "Add user" dialog opens over the users page', async () => {
        await usersPage.openAddUserDialog();
        await usersPage.assertAddUserDialogIsShown();
      });

      await test.step('First- and lastname, ID code, User role(s), Display Name and E-mail are flagged "Required" when left empty and the dialog stays open', async () => {
        await usersPage.confirmAddUser();
        await usersPage.assertRequiredFieldsFlagged(['ID code', ...USER_REQUIRED_FIELDS]);
        await usersPage.assertAddUserDialogIsShown();
      });

      await test.step('An ID code without the country prefix is rejected as "Invalid Id Code" and the dialog stays open', async () => {
        await usersPage.fillAddUserDialog(rejectedUser);
        await usersPage.fillUserField('ID code', rejectedUser.personalCode);
        await usersPage.confirmAddUser();
        await usersPage.assertFieldRejected('ID code', INVALID_USER_ID_CODE_MESSAGE);
        await usersPage.assertAddUserDialogIsShown();
      });

      await test.step('The ID code of an existing user is rejected with "User Exists" and the dialog stays open', async () => {
        await usersPage.fillUserField('ID code', `EE${ADMIN_PERSONAL_CODE}`);
        await usersPage.confirmAddUser();
        await usersPage.assertUserExistsReported();
        await usersPage.assertAddUserDialogIsShown();
      });

      await test.step('A malformed e-mail is rejected as "Invalid email" and the dialog stays open', async () => {
        await usersPage.fillUserField('ID code', `EE${rejectedUser.personalCode}`);
        await usersPage.fillUserField('E-mail', 'not-an-email');
        await usersPage.confirmAddUser();
        await usersPage.assertFieldRejected('E-mail', INVALID_USER_EMAIL_MESSAGE);
        await usersPage.assertAddUserDialogIsShown();
      });

      await test.step('The users table lists no user under the entered name', async () => {
        await usersPage.open();
        await usersPage.assertUserNotListed(rejectedUser.name);
      });
    },
  );
});

test.describe('[administration] [functional] Editing a user replaces their details in the users table', () => {
  const editedUser = createUserData('autotestedituser');
  const updatedUser = createUpdatedUserData(editedUser);

  test.afterEach(userCleanup(() => editedUser.personalCode));

  test(
    'Saving a new name, display name and e-mail closes the dialog, confirms it and lists the updated values',
    { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/123/' } },
    async ({ usersPage }) => {
      await usersPage.open();

      await test.step('A user to edit is listed in the users table', async () => {
        await usersPage.openAddUserDialog();
        await usersPage.fillAddUserDialog(editedUser);
        await usersPage.confirmAddUser();
        await usersPage.assertUserListed(editedUser);
      });

      await test.step('The "Edit user" dialog opens over the row of the new user', async () => {
        await usersPage.openEditUserDialog(editedUser.personalCode);
        await usersPage.assertEditUserDialogIsShown();
      });

      await test.step('Saving the new name, display name and e-mail closes the dialog', async () => {
        await usersPage.fillEditUserDialog(updatedUser);
        await usersPage.confirmEditUser();
        await usersPage.assertEditUserDialogClosed();
      });

      await test.step('The back office confirms with "User updated"', async () => {
        await usersPage.assertUserUpdatedConfirmed();
      });

      await test.step('The users table lists the user with the updated values', async () => {
        await usersPage.assertUserListed(updatedUser);
      });
    },
  );
});

test.describe('[administration] [functional] The edit user dialog rejects missing and invalid details', () => {
  const rejectedEditUser = createUserData('autotestinvalidedituser');

  test.afterEach(userCleanup(() => rejectedEditUser.personalCode));

  test(
    'Emptied required fields and a malformed e-mail are rejected and leave the user unchanged',
    { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/162/' } },
    async ({ usersPage }) => {
      await usersPage.open();

      await test.step('A user to edit is listed in the users table', async () => {
        await usersPage.openAddUserDialog();
        await usersPage.fillAddUserDialog(rejectedEditUser);
        await usersPage.confirmAddUser();
        await usersPage.assertUserListed(rejectedEditUser);
      });

      await test.step('The "Edit user" dialog opens over the row of the new user', async () => {
        await usersPage.openEditUserDialog(rejectedEditUser.personalCode);
        await usersPage.assertEditUserDialogIsShown();
      });

      await test.step('First- and lastname, User role(s), Display Name and E-mail are flagged "Required" when emptied and the dialog stays open', async () => {
        await usersPage.clearEditUserDialog(rejectedEditUser);
        await usersPage.confirmEditUser();
        await usersPage.assertRequiredFieldsFlagged(USER_REQUIRED_FIELDS);
        await usersPage.assertEditUserDialogIsShown();
      });

      await test.step('A malformed e-mail is rejected as "Invalid email" and the dialog stays open', async () => {
        await usersPage.fillEditUserDialog(rejectedEditUser, { roles: true });
        await usersPage.fillUserField('E-mail', 'not-an-email');
        await usersPage.confirmEditUser();
        await usersPage.assertFieldRejected('E-mail', INVALID_USER_EMAIL_MESSAGE);
        await usersPage.assertEditUserDialogIsShown();
      });

      await test.step('The users table still lists the user with their original values', async () => {
        await usersPage.open();
        await usersPage.assertUserListed(rejectedEditUser);
      });
    },
  );
});

test.describe('[administration] [functional] Deleting a user removes them from the users table', () => {
  const deletedUser = createUserData('autotestdeleteuser');

  test.afterEach(userCleanup(() => deletedUser.personalCode));

  test(
    'Confirming the deletion is answered with "User deleted" and drops the row',
    { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/124/' } },
    async ({ usersPage }) => {
      await usersPage.open();

      await test.step('A user to delete is listed in the users table', async () => {
        await usersPage.openAddUserDialog();
        await usersPage.fillAddUserDialog(deletedUser);
        await usersPage.confirmAddUser();
        await usersPage.assertUserListed(deletedUser);
      });

      await test.step('Confirming "Yes" in the "Delete user" dialog is answered with "User deleted"', async () => {
        await usersPage.openDeleteUserDialog(deletedUser.personalCode);
        await usersPage.confirmDeleteUser();
        await usersPage.assertUserDeletedConfirmed();
      });

      await test.step('The users table no longer lists the deleted user', async () => {
        await usersPage.assertUserNotListed(deletedUser.name);
      });
    },
  );
});
