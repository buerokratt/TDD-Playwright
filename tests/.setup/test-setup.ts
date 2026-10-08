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
import { ACTION_TIMEOUT } from '@utils/constants';
import { AdminPagesFixtures, ReadyPage } from '@utils/interfaces';
import { waitForRouteReady } from '@utils/waits';

export const test = base.extend<{ page: ReadyPage } & AdminPagesFixtures>({
  page: async ({ page }, use) => {
    const readyPage = page as ReadyPage;
    const originalGoto = page.goto.bind(page);

    page.goto = async (url, options = {}) => {
      const result = await originalGoto(url, {
        waitUntil: 'domcontentloaded',
        ...options,
      });
      await waitForRouteReady(page, url, { timeout: options.timeout ?? ACTION_TIMEOUT });
      return result;
    };

    readyPage.waitForRouteReady = async (url, options = {}) => {
      await waitForRouteReady(page, url, options);
    };

    page.on('console', (msg) => {
      const errorPattern =
        /error|failed|uncaught|exception|typeerror|referenceerror|syntaxerror|rangeerror|evalerror|urlerror|is not defined|cannot read|undefined|null is not an object/i;

      if (msg.type() === 'error' || errorPattern.test(msg.text())) {
        console.log(`[${msg.type().toUpperCase()}] ${msg.text()}`);
      }
    });

    await use(readyPage);
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
});

export { expect };
