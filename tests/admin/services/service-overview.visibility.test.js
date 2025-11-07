import {ServicesOverviewPage} from "../../../page-objects/services/overview/services-overview-page";

const { test, expect } = require('../../test-setup');
import { URLS } from '../../../playwright.config';

test('Service overview page elements visibility', async ({ page }) => {

    await page.goto(URLS.admin + 'services/overview');

    const sop = new ServicesOverviewPage(page);

    /*
    *  Pealkiri „Teenused“
    * Pealkiri „Üldteenused“
    * Nupp „Loo uus teenus“
    * Teenused tabel ja Üldteenused tabel
    * Veerupäised Nimetus, Ühendatud teema, Olek – mõlemas tabelis
    * Iga rea juures on nähtav teenuse nimi, ühendatud teema või link „Ühendage teemaga“, nupud „Muuda“ ja „Kustuta“
    * Rippmenüü „Kuvan korraga“ mõlemas tabelis
    * */
    await test.step('Service name visibility', async () => {
        await sop.assertServiceNameExists();
    });

    await test.step('Intent field visibility', async () => {
        await sop.assertIntentFieldExists();
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

    await test.step('Pagination visibility', async () => {

    });

});