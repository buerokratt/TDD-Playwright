/*
*
* Elemendid: nähtavad baaselemendid
* Sõnum Kliendile: nähtavad baaselemendid
* Mitmevalikuline küsimus: nähtavad baaselemendid
* Dünaamilised valikud: nähtavad baaselemendid
* Teenuse lõpetamine: nähtavad baaselemendid
*
* */

import {NewServicePage} from "../../../../page-objects/services/newservice/new-service-page";

const { test, expect } = require('../../../.setup/test-setup');
import { URLS } from '../../../../playwright.config';

test('Service canvas base elements visibility', async ({ page }) => {
    await page.goto(URLS.admin + 'services/newService');
    const nsp = new NewServicePage(page);

    await test.step('Service header elements visibility', async () => {
        await nsp.assertHeaderElementVisible();
    });

    await test.step('Service information elements visibility', async () => {
        await nsp.assertServiceDetailsFieldsVisible();
    });

    await test.step('Service canvas visibility', async () => {
        await nsp.assertCanvasVisible();
    });

    await test.step('Service canvas header elements visibility', async () => {
        await nsp.assertCanvasElementsVisible();
    });

    await test.step('Service canvas zoom buttons visibility', async () => {
        await nsp.assertZoomButtonsVisible();
    });
});