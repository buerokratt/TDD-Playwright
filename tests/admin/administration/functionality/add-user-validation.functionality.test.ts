import { AdminPageFactory } from '@page-objects/admin-page-factory';
import { test } from '@setup/test-setup';
import { ADMIN_PERSONAL_CODE } from '@utils/constants';
import { userCleanup } from '@utils/helpers';
import { createUserData } from '@utils/test-data';

const user = createUserData('autotestinvaliduser');

test.describe(
  '[administration] [functional] The add user dialog rejects missing and invalid details',
  { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/121/' } },
  () => {
    test.afterEach(userCleanup(() => user.personalCode));

    test('Empty fields, a malformed or taken ID code and a malformed e-mail are rejected and add no user', async ({
      page,
    }) => {
      const up = new AdminPageFactory(page).getUsersPage();

      await up.open();

      await test.step('The "Add user" dialog opens over the users page', async () => {
        await up.openAddUser();
        await up.assertAddUserDialogIsShown();
      });

      await test.step('First- and lastname, ID code, User role(s), Display Name and E-mail are flagged "Required" when left empty', async () => {
        await up.confirmAddUser();
        await up.assertRequiredFieldsFlagged();
      });

      await test.step('An ID code without the country prefix is rejected as "Invalid Id Code"', async () => {
        await up.fillAddUser(user);
        await up.fillIdCode(user.personalCode);
        await up.confirmAddUser();
        await up.assertFieldRejected('ID code', 'Invalid Id Code');
      });

      await test.step('The ID code of an existing user is rejected with "User Exists"', async () => {
        await up.fillIdCode(`EE${ADMIN_PERSONAL_CODE}`);
        await up.confirmAddUser();
        await up.assertUserExistsReported();
      });

      await test.step('A malformed e-mail is rejected as "Invalid email"', async () => {
        await up.fillIdCode(`EE${user.personalCode}`);
        await up.fillEmail('not-an-email');
        await up.confirmAddUser();
        await up.assertFieldRejected('E-mail', 'Invalid email');
      });

      await test.step('The "Add user" dialog stays open after every rejected attempt', async () => {
        await up.assertAddUserDialogIsShown();
      });

      await test.step('The users table lists no user under the entered name', async () => {
        await up.open();
        await up.assertUserNotListed(user.name);
      });
    });
  },
);
