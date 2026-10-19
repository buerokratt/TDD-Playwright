import { test as base, expect } from '@playwright/test';

import { ActiveChatsPage, HistoryPage, UnansweredChatsPage } from '@page-objects/chats';
import { Header, SideMenu } from '@page-objects/menu';
import { NewServicePage, ServicesOverviewPage } from '@page-objects/services';
import {
  AnonymizerPage,
  ChatAnalysisPage,
  DeleteConversationsPage,
  MultiDomainsPage,
  OfficeOpeningHoursPage,
  SessionLengthPage,
} from '@page-objects/settings';
import { WidgetPage } from '@page-objects/widget';
import { ACTION_TIMEOUT } from '@utils/constants';
import { seedEnglishLocale } from '@utils/helpers';
import { AdminFixtures, CustomerFixtures } from '@utils/interfaces';
import { waitForRouteReady } from '@utils/waits';

export const test = base.extend<AdminFixtures & CustomerFixtures>({
  page: async ({ page }, use) => {
    const originalGoto = page.goto.bind(page);

    page.goto = async (url, options = {}) => {
      const result = await originalGoto(url, {
        waitUntil: 'domcontentloaded',
        ...options,
      });
      await waitForRouteReady(page, url, { timeout: options.timeout ?? ACTION_TIMEOUT });
      return result;
    };

    await use(page);
  },
  header: async ({ page }, use) => use(new Header(page)),
  sideMenu: async ({ page }, use) => use(new SideMenu(page)),
  unansweredChatsPage: async ({ page }, use) => use(new UnansweredChatsPage(page)),
  activeChatsPage: async ({ page }, use) => use(new ActiveChatsPage(page)),
  historyPage: async ({ page }, use) => use(new HistoryPage(page)),
  servicesOverviewPage: async ({ page }, use) => use(new ServicesOverviewPage(page)),
  newServicePage: async ({ page }, use) => use(new NewServicePage(page)),
  chatAnalysisPage: async ({ page }, use) => use(new ChatAnalysisPage(page)),
  officeOpeningHoursPage: async ({ page }, use) => use(new OfficeOpeningHoursPage(page)),
  sessionLengthPage: async ({ page }, use) => use(new SessionLengthPage(page)),
  deleteConversationsPage: async ({ page }, use) => use(new DeleteConversationsPage(page)),
  anonymizerPage: async ({ page }, use) => use(new AnonymizerPage(page)),
  multiDomainsPage: async ({ page }, use) => use(new MultiDomainsPage(page)),
  customerPage: async ({ browser }, use) => {
    const context = await browser.newContext();

    try {
      await seedEnglishLocale(context);
      await use(await context.newPage());
    } finally {
      await context.close();
    }
  },
  widgetPage: async ({ customerPage }, use) => use(new WidgetPage(customerPage)),
});

export { expect };
