/*
* 1. new service
* 2. save service
* 3. add node
* 4. add api endpoint
* 5. select openapi
* 6. create endpoint
* 7. delete service
* */

import {NewServicePage} from "../../../../page-objects/services/newservice/new-service-page";

const { test, expect } = require('../../../.setup/test-setup');
import { URLS } from '../../../../playwright.config';

test('Create new openAPI endpoint test', async({page}) => {
    const nsp = new NewServicePage(page);
    await page.goto(URLS.admin + 'services/newService');

    await test.step('Save service', async() => {
        await nsp.saveService();
    });

    await test.step('Assert dropdown elements correct', async() => {
        await nsp.addNewAPI();
    });

    await test.step('Save service', async() => {});

    await test.step('Save service', async() => {});

    await test.step('Save service', async() => {});

});