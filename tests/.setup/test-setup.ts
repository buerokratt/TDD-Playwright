import { test as base, expect, type Page } from '@playwright/test';
import { waitForRouteReady } from '@utils/waits/admin-page-ready';

type RouteReadyOptions = { timeout?: number };

export interface ReadyPage extends Page {
  waitForRouteReady(url: string, options?: RouteReadyOptions): Promise<void>;
}

export const test = base.extend<{ page: ReadyPage }>({
  page: async ({ page }, use) => {
    const readyPage = page as ReadyPage;
    const originalGoto = page.goto.bind(page);

    page.goto = async (url, options = {}) => {
      const result = await originalGoto(url, {
        waitUntil: 'domcontentloaded',
        ...options,
      });
      await waitForRouteReady(page, url, { timeout: options.timeout ?? 15000 });
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
});

export { expect };
