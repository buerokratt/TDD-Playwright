// SERVICE CREATION STEPS
// TRAINING
// 1. Create new intent
// 2. Format intent questions
// 3. Add intent to model
// 4. Add intent for use of service
//
//     SERVICE
// 5. Create a service
// 6. Connect the service with new intent
//
//     TRAINING
// 7. Train model
// 8. Activate model
// 9. Active service

import { URLS } from '../../../playwright.config';
const { test, expect } = require('../../.setup/test-setup');
const { AdminPageFactory: ap} = require('../../../page-objects/admin-page-factory');

const randomString = Math.random().toString(36).substring(2, 10);

test.skip('Service creation flow', async ({ page }) => {
   // await page.goto(URLS.admin + 'training/training/intents');
   // await page.waitForTimeout(3000);
   //
   //

   const apf = new ap(page);
   const iop = apf.getIntentsPage();
   await iop.createNewIntent(randomString);

   // TODO: näidete lisamine teemasse

    await page.goto(URLS.admin + 'training/train-new-model');
    const nmp = apf.getNewModelPage();

    await nmp.isPageHeaderVisible();

    const nsp = apf.getNewServicePage();
    const sop = apf.getServicesOverview();

    await page.goto(URLS.admin + 'services/newService');

    await nsp.createNewService(randomString);
    await sop.clickEdit(randomString);

    await nsp.addNodes();

    await nsp.editNode('Sõnum kliendile - 1');
    await page.waitForTimeout(3000);
    await nsp.addMessage('test');
    await nsp.buttonSave.last().click();

    await nsp.buttonSave.click();

    await nsp.returnToServicesOverview();
    await sop.assertServiceRowVisible(randomString);

    // TODO: confirm service
    // TODO: connect service with intent

    // TODO: disabled until service creation logic is done
    // await nmp.clickTrainButton();
});