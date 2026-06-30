import { AdminPageFactory } from '@page-objects/admin-page-factory';
import { WidgetPage } from '@page-objects/widget/widget-page';
import { test, expect } from '@playwright/test';

import { URLS } from '@utils/env/urls';

test('[e2e] [chats] Chat flow test', async ({ browser }) => {
  const customerContext = await browser.newContext();
  const csaContext = await browser.newContext({
    storageState: 'tests/admin/.auth/user.json',
  });

  const cPage = await customerContext.newPage();
  const page = await csaContext.newPage();

  page.on('console', (msg) => {
    const errorPattern =
      /error|failed|uncaught|exception|typeerror|referenceerror|syntaxerror|rangeerror|evalerror|urlerror|is not defined|cannot read|undefined|null is not an object/i;
    if (msg.type() === 'error' || errorPattern.test(msg.text())) {
      console.log(`[${msg.type().toUpperCase()}] ${msg.text()}`);
    }
  });

  await Promise.all([cPage.goto(URLS.customer), page.goto(`${URLS.admin}chat/unanswered`)]);

  const csaPage = new AdminPageFactory(page);
  const customerPage = new WidgetPage(cPage);

  await csaPage.getPageHeader().markCSAPresent();

  await cPage.bringToFront();
  await customerPage.openChat();
  await customerPage.getCSAChat();

  await page.bringToFront();
  await csaPage.getChats().acceptChat();

  await expect(page.getByRole('tablist', { name: 'Aktiivsed vestlused' })).toBeVisible();
  await expect(page.getByText('Lõpeta vestlus')).toBeVisible();

  await customerContext.close();
  await csaContext.close();
});
