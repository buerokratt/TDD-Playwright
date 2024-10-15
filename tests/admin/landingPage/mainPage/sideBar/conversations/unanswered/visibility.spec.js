import { test, expect } from '@playwright/test';
import { openDialog, selectFirstChat, takeOverFirstChat } from '../unanswered/helper';
const { getTranslations } = require('../../../../../../translations/languageDetector');


test.describe('"Vastamata" page visibility', async () => {
    let translation;

    test.beforeEach(async ({ page }) => {
        await page.goto('https://admin.prod.buerokratt.ee/chat/unanswered');
        await page.waitForTimeout(4000);
        translation = await getTranslations(page);
    })

    test('should have the correct URL', async ({ page }) => {
        await expect(page).toHaveURL('https://admin.prod.buerokratt.ee/chat/unanswered');
    });

    test('should have "Vastamata vestlused" vertical tabs', async ({ page }) => {
        const verticalTabs = page.locator('div.vertical-tabs');
        await expect(verticalTabs).toBeVisible();
    })

    test('should have "Vastamata vestlused" section, where all unanswered conversations are listed', async ({ page }) => {
        const unansweredConversationsSection = page.locator('div.vertical-tabs__list');
        await expect(unansweredConversationsSection).toBeVisible();
    })

    test('should have "Vastamata vestlused" / "Unanswered chats" title', async ({ page }) => {
        const divElement = page.locator('.vertical-tabs__group-header');

        const pText = divElement.locator('p');

        await expect(pText).toHaveText(new RegExp(translation.unansweredConversations));
    });


    test('should have "Vastamata vestlused" main chat window', async ({ page }) => {
        const divElement = page.locator('div.vertical-tabs__body-placeholder');

        await expect(divElement).toBeVisible();
    });


    test('should have "Alustamiseks vali vestlus" / "Choose a chat to begin" text', async ({ page }) => {
        const divElement = page.locator('div.vertical-tabs__body-placeholder');

        const pText = divElement.locator('p');

        await expect(pText).toHaveText(translation.chooseChatToBegin);
    });

});

test.describe('Selected conversation open chat visibility tests', () => {
    let translation;
    test.beforeEach(async ({ page }) => {
        await page.goto('https://admin.prod.buerokratt.ee/chat/unanswered');
        await page.waitForTimeout(4000);
        const switchButton = await page.locator('.switch__button');
        const isChecked = await switchButton.getAttribute('aria-checked');
        if (isChecked !== 'true') {
            await switchButton.click();
        }

        await selectFirstChat(page);
        translation = await getTranslations(page);

    });


    test('Should have individual meta information fields', async ({ page }) => {

        test.info().annotations.push({
            type: 'Known bug',
            description: 'There is a bug regarding this test as it does not let to open the chat before you go to any other tab and come back.',
        })

        const chatSideMeta = page.locator('div.active-chat__side-meta')
        await expect(chatSideMeta).toBeVisible();

        // Verify individual meta information fields
        const pElement = page.locator('p strong')
        await expect(pElement.filter({ hasText: new RegExp(translation.id) })).toBeVisible();
        await expect(pElement.filter({ hasText: new RegExp(translation.endUserName) })).toBeVisible();
        await expect(pElement.filter({ hasText: new RegExp(translation.chatStartedAt) })).toBeVisible();
        await expect(pElement.filter({ hasText: new RegExp(translation.device) })).toBeVisible();
        await expect(pElement.filter({ hasText: new RegExp(translation.location) })).toBeVisible();


    });


    test('Should have active chat side actions', async ({ page }) => {
        // Get all chats
        const chatSideActions = page.locator('div.active-chat__side-actions')
        await expect(chatSideActions).toBeVisible();

        // Verify side action buttons
        const buttonElement = page.locator('div.active-chat__side-actions button')
        await expect(buttonElement.filter({ hasText: new RegExp(translation.endChat) })).toBeVisible();
        await expect(buttonElement.filter({ hasText: new RegExp(translation.askAuthentication) })).toBeVisible();
        await expect(buttonElement.filter({ hasText: new RegExp(translation.askContactInformation) })).toBeVisible();
        await expect(buttonElement.filter({ hasText: new RegExp(translation.askPermission) })).toBeVisible();
        await expect(buttonElement.filter({ hasText: new RegExp(translation.forwardToColleague) })).toBeVisible();
        // await expect(buttonElement.filter({ hasText: /Suuna asutusele/ })).toBeVisible();
        // await expect(buttonElement.filter({ hasText: /Saada e-posti/ })).toBeVisible();
        // await expect(buttonElement.filter({ hasText: /Alusta teenust/ })).toBeVisible();
    });


    test('Should have "Võta üle" / "Take over" button', async ({ page }) => {
        // Verify side action buttons
        const buttonElement = page.locator('div.active-chat__toolbar-actions button')
        await expect(buttonElement.filter({ hasText: new RegExp(translation.takeOver) })).toBeVisible();
    });


    test('Should have active chat side actions like ask authentication, ask contact information, ask permission disabled until chat is taken over', async ({ page }) => {
        // Get all chats
        const chatSideActions = page.locator('div.active-chat__side-actions')

        const askAuthenticationButton = chatSideActions.locator('button').filter({ hasText: new RegExp(translation.askAuthentication) });
        const askContactInformationButton = chatSideActions.locator('button').filter({ hasText: new RegExp(translation.askContactInformation) });
        const askPermissionButton = chatSideActions.locator('button').filter({ hasText: new RegExp(translation.askPermission) });


        await expect(askAuthenticationButton).toBeVisible();
        await expect(askAuthenticationButton).toBeDisabled();

        await expect(askContactInformationButton).toBeVisible();
        await expect(askContactInformationButton).toBeDisabled();

        await expect(askPermissionButton).toBeVisible();
        await expect(askPermissionButton).toBeDisabled();

        const takeOverButton = page.locator(`button:has-text("${translation.takeOver}")`);
        await takeOverButton.click();

        await expect(askAuthenticationButton).not.toBeDisabled();
        await expect(askContactInformationButton).not.toBeDisabled();
        await expect(askPermissionButton).not.toBeDisabled();
    });


    test('Should have active chat header', async ({ page }) => {
        // Verify chat header
        const header = page.locator('div.active-chat__header');
        const pElement = header.locator('p');
        const h3 = header.locator('h3');

        await expect(pElement).toBeVisible();
        await expect(h3).toBeVisible();
    });

});


test.describe('"Vali vestluse staatus" dialog visibility', async () => {
    let translation;
    test.beforeEach(async ({ page }) => {
        await page.goto('https://admin.prod.buerokratt.ee/chat/unanswered');
        await page.waitForTimeout(4000);

        const switchButton = await page.locator('.switch__button');
        const isChecked = await switchButton.getAttribute('aria-checked');
        if (isChecked !== 'true') {
            await switchButton.click();
        }

        await selectFirstChat(page);

        translation = await getTranslations(page);

        const endChatButtonSelector = page.locator(`button.btn.btn--success.btn--m:has-text("${translation.endChat}")`);

        await endChatButtonSelector.click();

        await page.waitForTimeout(2000);

    })


    test('Should have all dialog parts', async ({ page }) => {
        const dialog = page.locator('div.dialog')
        await expect(dialog).toBeVisible();

        const title = page.locator('div.dialog__header')
        await expect(title).toBeVisible();

        const body = page.locator('div.dialog__body')
        await expect(body).toBeVisible();

        const radios = page.locator('fieldset.radios .radios__item input[type="radio"]');
        await expect(radios).toHaveCount(4);
    });

    test('Should have all radio labels visible', async ({ page }) => {
        const radioItems = page.locator('fieldset.radios .radios__item');

        // Expected labels and their corresponding texts
        const expectedLabels = [
            translation.acceptedResponse,
            translation.hateSpeech,
            translation.otherReasons,
            translation.responseSentToClient
        ];

        // Check visibility and text of each label
        for (let i = 0; i < 4; i++) {
            const radioItem = radioItems.nth(i);
            const label = radioItem.locator('label');

            await expect(label).toBeVisible();
            await expect(label).toHaveText(expectedLabels[i]);
        }
    });
})


test.describe('"Suuna kolleegile" active chat actions dialog visibility', () => {
    let translation;
    let headers;
    test.beforeEach(async ({ page }) => {

        await page.goto('https://admin.prod.buerokratt.ee/chat/unanswered');
        await page.waitForTimeout(4000);

        const switchButton = await page.locator('.switch__button');
        const isChecked = await switchButton.getAttribute('aria-checked');
        if (isChecked !== 'true') {
            await switchButton.click();
        }

        translation = await getTranslations(page);


        headers = [
            new RegExp(`^${translation.name}$`), new RegExp(`^${translation.displayName}$`), new RegExp(`^${translation.status}$`)
        ];
        await selectFirstChat(page);
        await takeOverFirstChat(page);
        await openDialog(page, translation.forwardToColleague)
    })


    test('After clicking on "Suuna kolleegile" button should have "Kellele vastust suunata?" dialog header and body parts visible', async ({ page }) => {
        // header parse 
        const dialogHeader = page.locator('.dialog__header');
        await expect(dialogHeader).toBeVisible();

        const dialogTitle = dialogHeader.locator('h2.dialog__title');
        await expect(dialogTitle).toHaveText(translation.whoToForward);

        const closeButton = dialogHeader.locator('button.dialog__close');
        await expect(closeButton).toBeVisible();

        // body parts
        const dialogBody = page.locator('.dialog__body');
        await expect(dialogBody).toBeVisible();

        // Check input field visibility and placeholder
        const inputField = dialogBody.locator(`input[name="search"]`);
        await expect(inputField).toBeVisible();
        await expect(inputField).toHaveAttribute('placeholder', translation.searchByName);

        // Check checkbox visibility
        const checkbox = page.getByText(translation.showOnlyActiveAgents);
        await expect(checkbox).toBeVisible();

        const table = page.locator('.data-table');
        await expect(table).toBeVisible();

        // Check if each column header is rendered
        for (const header of headers) {
            const headerElement = table.locator(`th`).filter({ hasText: header });
            await expect(headerElement).toBeVisible();
        }
        //const lastTrainedText = page.locator('p').filter({ hasText: new RegExp(`^${translations.lastTrained} .+`) });


        // Iterate over each header and check if the sorting button exists
        for (const header of headers) {
            const sortingButton = page.locator('th').filter({ hasText: header }).locator('button');
            await expect(sortingButton).toBeVisible();
        }


        // Check for table pagination
        const pageSizeSelector = page.locator('.data-table__page-size select');
        await expect(pageSizeSelector).toBeVisible();

        const options = ['10', '20', '30', '40', '50'];
        for (const option of options) {
            await pageSizeSelector.selectOption(option);
            await expect(pageSizeSelector).toHaveValue(option);
        }
    });

})