import { test, expect } from '@playwright/test';
import { URLS } from '../../playwright.config';

test('Chat flow test', async ({ browser })=>{
    const customerContext = await browser.newContext();
    const csaContext = await browser.newContext({
        storageState: 'tests/admin/.auth/user.json'
    });

    const customerPage = await customerContext.newPage();
    const csaPage = await csaContext.newPage();

    await Promise.all([
        customerPage.goto(URLS.customer),
        csaPage.goto(URLS.admin + 'chat/unanswered')
    ]);

    const inputField = customerPage.getByPlaceholder('Kirjutage oma sõnum...');
    const sendButton = customerPage.getByTitle('Saada');

    const messages = [
        { from: 'customer', text: 'tere'},
        { from: 'customer', text: 'jah'},
        { from: 'csa', text: 'tere'},
    ];

    if (await csaPage.getByRole('switch').getAttribute('data-state') === 'unchecked') {
        await csaPage.getByRole('switch').click();
    }

    await customerPage.bringToFront();
    await customerPage.getByTitle('Ava vestlus').click();
    await customerPage.getByText('Bürokratt').isVisible();
    await inputField.fill('tere');
    await sendButton.click();
    await customerPage.getByText('Kuidas saan abiks olla?').isVisible();
    await inputField.fill('suuna mind');
    await sendButton.click();
    await customerPage.getByText('Suunan teid klienditeenindajale. Varuge natukene kannatust.').isVisible();

    await csaPage.bringToFront();
    await customerPage.waitForTimeout(3000);
    await csaPage.getByRole('tablist').getByRole('tab').last().click();
    await csaPage.getByText('Võta üle').click();

    await csaPage.goto('https://admin.stage.buerokratt.ee/chat/active');
    await csaPage.getByRole('tablist').getByRole('tab').isVisible();

    await customerPage.close();
    await customerContext.close();
});