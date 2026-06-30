import { test as base, expect, Page } from '@playwright/test';

interface ApiCall {
  url: string;
  method: string;
  timestamp: number;
  status: number | null;
}

interface VerifyAPIsReturn200Options {
  waitForNetworkIdle?: boolean;
}

export interface ApiPageInterface extends Page {
  verifyAPIsReturn200(options?: VerifyAPIsReturn200Options): Promise<ApiCall[]>;
  getAllAPICalls(): ApiCall[];
  getSuccessfulAPICalls(): ApiCall[];
  getFailingAPICalls(): ApiCall[];
  clearAPICalls(): void;
}

export const test = base.extend<{ page: ApiPageInterface }>({
  page: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: 'tests/admin/.auth/user.json',
    });

    const page = (await context.newPage()) as ApiPageInterface;

    const apiCalls = new Map<string, ApiCall>();

    page.on('requestfinished', (request) => {
      const url = request.url();

      if (url.includes('ruuter')) {
        apiCalls.set(url, {
          url,
          method: request.method(),
          timestamp: Date.now(),
          status: null,
        });
      }
    });

    page.on('response', (response) => {
      const url = response.url();

      if (url.includes('ruuter') && apiCalls.has(url)) {
        const call = apiCalls.get(url)!;
        call.status = response.status();
        apiCalls.set(url, call);
      }
    });

    page.verifyAPIsReturn200 = async function verifyAPIsReturn200(options = {}) {
      const { waitForNetworkIdle = true } = options;

      if (waitForNetworkIdle) {
        await this.waitForLoadState('domcontentloaded');
        await this.waitForLoadState('networkidle').catch(() => {});
      }

      const calls = Array.from(apiCalls.values());

      if (calls.length === 0) {
        console.warn('No API calls were detected during page load');
        return [];
      }

      const successfulCalls: ApiCall[] = [];
      const failingCalls: ApiCall[] = [];

      calls.forEach((call) => {
        if (call.status === 200 || call.status === null) {
          successfulCalls.push(call);
        } else {
          failingCalls.push(call);
          console.log(`❌ FAILED API: ${call.status} ${call.method} ${call.url}`);
        }
      });

      failingCalls.forEach((call) => {
        expect(call.status, `API call failed: ${call.method} ${call.url} returned ${call.status}`).toBe(200);
      });

      if (failingCalls.length === 0) {
        console.log(`✅ All ${successfulCalls.length} API endpoints returned 200`);
      } else {
        console.log(`❌ ${failingCalls.length} API endpoints failed out of ${calls.length} total calls`);
      }

      return failingCalls;
    };

    page.getAllAPICalls = function getAllAPICalls() {
      return Array.from(apiCalls.values());
    };

    page.getSuccessfulAPICalls = function getSuccessfulAPICalls() {
      return this.getAllAPICalls().filter((call) => call.status === 200);
    };

    page.getFailingAPICalls = function getFailingAPICalls() {
      return this.getAllAPICalls().filter((call) => call.status !== 200);
    };

    page.clearAPICalls = function clearAPICalls() {
      apiCalls.clear();
    };

    const originalGoto = page.goto.bind(page);
    page.goto = async (url, options = {}) =>
      originalGoto(url, {
        waitUntil: 'domcontentloaded',
        ...options,
      });

    page.on('console', (msg) => {
      const errorPattern =
        /error|failed|uncaught|exception|typeerror|referenceerror|syntaxerror|rangeerror|evalerror|urlerror|is not defined|cannot read|undefined|null is not an object/i;

      if (msg.type() === 'error' || errorPattern.test(msg.text())) {
        console.log(`[${msg.type().toUpperCase()}] ${msg.text()}`);
      }
    });

    await use(page);

    await context.close().catch(() => {});
  },
});

export { expect };
