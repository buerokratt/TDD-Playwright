import { AdminPageFactory } from '@page-objects/admin-page-factory';
import { test } from '@setup/test-setup';
import { ADMIN_PERSONAL_CODE, USERS_TABLE_RESULT_COUNTS } from '@utils/constants';
import { usersPageSizeCleanup } from '@utils/helpers';

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
