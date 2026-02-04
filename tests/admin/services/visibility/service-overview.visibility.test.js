import {ServicesOverviewPage} from "../../../../page-objects/services/overview/services-overview-page";

const { test, expect } = require('../../../.setup/test-setup');
import { URLS } from '../../../../playwright.config';

test('Service overview page elements visibility', async ({ page }) => {

    await page.goto(URLS.admin + 'services/overview');

    const sop = new ServicesOverviewPage(page);

    await test.step('Service name visibility', async () => {
        await sop.assertServiceNameExists();
    });

    await test.step('Service status visibility', async () => {
        await sop.assertStatusExists();
    });

    await test.step('Edit button visibility', async () => {
        await sop.assertEditButtonExists();
    });

    await test.step('Delete button visibility', async () => {
        await sop.assertDeleteButtonExists();
    });

    await test.step('Pagination visibility services table', async () => {
        await sop.assertPageSizeVisibleServices();
    });

});