import { test } from '@setup/test-setup';

test.describe(
  '[administration] [visibility] The conversations deletion page shows the whole deletion form',
  { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/156/' } },
  () => {
    test('The page shows its heading and description and offers both removals with a way to save them', async ({
      deleteConversationsPage,
    }) => {
      await deleteConversationsPage.open();

      await test.step('The page shows its heading and description', async () => {
        await deleteConversationsPage.assertPageHeadingAndDescriptionAreShown();
      });

      await test.step('Both removals are offered as toggles with their tooltips', async () => {
        await deleteConversationsPage.assertRemovalTogglesOffered();
      });

      await test.step('The rules can be saved', async () => {
        await deleteConversationsPage.assertSaveOffered();
      });
    });

    test('With both removals switched on, every field the rules need is on the page', async ({
      deleteConversationsPage,
    }) => {
      await deleteConversationsPage.open();

      await test.step('Both removals are switched on', async () => {
        await deleteConversationsPage.setAuthenticatedRemoval(true);
        await deleteConversationsPage.setAnonymousRemoval(true);
      });

      await test.step('Each removal takes a period in days and explains what it deletes', async () => {
        await deleteConversationsPage.assertPeriodFieldsOffered();
      });

      await test.step('The hour the deletion runs at is offered with its tooltip', async () => {
        await deleteConversationsPage.assertDeletionTimeOffered();
      });

      await test.step('The expiring conversations filter takes a range and offers its four shortcuts', async () => {
        await deleteConversationsPage.assertExpiringRangeOffered();
      });

      await test.step('The conversations falling in the period are counted', async () => {
        await deleteConversationsPage.assertConversationCountShown();
      });

      await test.step('The column selector offers every column the table lists', async () => {
        await deleteConversationsPage.assertColumnSelectorOffersEveryColumn();
      });

      await test.step('The table lists its columns, each with a control to sort by it', async () => {
        await deleteConversationsPage.assertTableListsEveryColumnWithSorting();
      });

      await test.step('A ninety day range fills the table, each conversation offered for viewing', async () => {
        await deleteConversationsPage.loadNinetyDayRange();
        await deleteConversationsPage.assertEveryRowEndsWithViewButton();
      });

      await test.step('The filled list is paged and the result count starts on the size the case names', async () => {
        await deleteConversationsPage.assertPagingOfferedWhenListOverflows();
        await deleteConversationsPage.assertResultCountOffered();
      });
    });
  },
);
