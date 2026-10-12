import { expect, test } from '@setup/test-setup';
import { WIDGET_DOMAINS_PATH } from '@utils/constants';
import { WidgetDomain } from '@utils/interfaces';

test.describe('[administration] [visibility] The multi-domains page shows its domains and controls', () => {
  test(
    'The page opens with every domain row complete and both controls offered',
    { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/151/' } },
    async ({ multiDomainsPage }) => {
      await multiDomainsPage.open();

      await test.step('The heading, the add control and the save control are on the page', async () => {
        await multiDomainsPage.assertPageIsShown();
      });

      await test.step('Every domain listed carries its name, its URL and a delete control', async () => {
        await multiDomainsPage.assertRowsAreComplete();
      });
    },
  );

  test('Every row holds the name and URL the back office returns, in the same order', async ({
    page,
    multiDomainsPage,
  }) => {
    const domainsLoaded = page.waitForResponse(
      (response) => response.url().includes(WIDGET_DOMAINS_PATH) && response.request().method() === 'GET',
    );

    await multiDomainsPage.open();

    const response = await domainsLoaded;

    expect(response.ok(), `The back office would not list its domains (${response.status()})`).toBeTruthy();

    const stored = ((await response.json()) as { response: WidgetDomain[] }).response;

    await test.step('Every name field is labelled with its row number', async () => {
      await multiDomainsPage.assertRowsNumbered();
    });

    await test.step('Every row holds the name and URL returned for it, in the returned order', async () => {
      await multiDomainsPage.assertRowsHold(stored);
    });
  });
});
