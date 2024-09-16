import { test, expect } from '@playwright/test';
import { openDialog, selectFirstChat, takeOverFirstChat } from '../unanswered/helper';

let translations;
// todo: cleaner path
import {getTranslations} from '../../../../../../translations/languageDetector'

test.beforeEach(async ({ page }) => {
    await page.goto('https://admin.test.buerokratt.ee/chat/unanswered');
    translations = await getTranslations(page);

   

    // before each test should turn switch on.
    await page.locator('.switch__button').click();
    await page.reload();
    await page.waitForTimeout(2000);


})

test('Check if clicking unanswered chat opens it ### Look issue inside',

    async ({ page }) => {

        test.info().annotations.push({
            type: 'Known bug',
            description: 'This test has a bug: after clicking to open the chat, it only works if you mark it as "Present", switch to another tab, return to the original tab, and then attempt to open the chat again.',
        })

        const chatOpened = await selectFirstChat(page);
        if (!chatOpened) return;


        // Check that all chat parts exist
        const chat = page.locator('div.active-chat__body');
        await expect(chat).toBeVisible();

        const chatHeader = page.locator('div.active-chat__header')
        await expect(chatHeader).toBeVisible();

        const chatWrapper = page.locator('div.active-chat__group-wrapper')
        await expect(chatWrapper).toBeVisible();

        const chatToolbar = page.locator('div.active-chat__toolbar')
        await expect(chatToolbar).toBeVisible();

        const chatSide = page.locator('div.active-chat__side')
        await expect(chatSide).toBeVisible();

        const chatSideActions = page.locator('div.active-chat__side-actions')
        await expect(chatSideActions).toBeVisible();

        const chatSideMeta = page.locator('div.active-chat__side-meta')
        await expect(chatSideMeta).toBeVisible();

        const chatHeaderText = page.locator('div.track h3')
        await expect(chatHeaderText).toBeVisible();

        // Ensure that the chat header text is not empty
        await expect(chatHeaderText).not.toHaveText('');
    });



test('Should open dialog, when "Lõpeta vestlus" button is clicked', async ({ page }) => {
    const chatOpened = await selectFirstChat(page);
    if (!chatOpened) return;

    const isDialogVisible = await openDialog(page, "Lõpeta vestlus");
    expect(isDialogVisible).toBe(true);

})


test('Should close dialog, when "Lõpeta vestlus" button is clicked', async ({ page }) => {
    const chatOpened = await selectFirstChat(page);
    if (!chatOpened) return;

    const isDialogVisible = await openDialog(page, "Lõpeta vestlus");
    expect(isDialogVisible).toBe(true);

    const dialog = page.locator('.dialog--default');
    const closeButton = dialog.getByRole('button', { name: translations.cancel });
    await closeButton.click();
    await expect(dialog).not.toBeVisible();
    
})


test('Should activate chat, when "Võta üle" button is clicked', async ({ page }) => {
    await takeOverFirstChat(page);

    const sideActionsButtons = page.locator('.active-chat__side-actions button');
    const sideButtonsCount = await sideActionsButtons.count();

    for (let i = 0; i < sideButtonsCount; i++) {
        const button = sideActionsButtons.nth(i);
        await expect(button).not.toHaveClass(/btn--disabled/);
    }

    await expect(page.locator('textarea#chatArea')).toBeVisible();
    await expect(page.locator('#myButton')).toBeVisible();
    await expect(page.locator('.active-chat__toolbar-actions > button:nth-child(2)')).toBeVisible();
})


test('Should be able to type text in chat input field', async ({ page }) => {
    await takeOverFirstChat(page);

    const textarea = page.locator('textarea#chatArea');
    const inputValue = 'Test input value';
    await textarea.fill(inputValue);
    await expect(textarea).toHaveValue(inputValue);

})


test('Verify that text appears in chat after sending button clicked', async ({ page }) => {

    await takeOverFirstChat(page);

    const textArea = page.locator('#chatArea');
    const message = 'Hello, this is a test message!';
    await textArea.fill(message);

    const sendButton = page.locator('#myButton');
    await sendButton.click();
    await page.waitForEvent(1000);

    const chatMessage = page.locator('.active-chat__message-text div').last();
    await expect(chatMessage).toHaveText(message);
});


test('click "Küsi autentimist" button and verify chat event', async ({ page }) => {
    await takeOverFirstChat(page);

    // Click on the "Küsi autentimist" button
    await page.click(`button.btn--secondary:has-text("${translations.askAuthentication}")`);

    // Get all chat messages
    const chatMessages = page.locator('div.active-chat__group.active-chat__group--event div.active-chat__event-message p');

    // Get last chat message that should be asking for authentication
    const lastMessage = chatMessages.last();


    // Verify the chat event message content
    await expect(lastMessage).toHaveText(new RegExp(translations.requestedAuthentication));
});

test('click "Küsi kontaktandmeid" button and verify chat event', async ({ page }) => {
    await takeOverFirstChat(page);

    // Click on the "Küsi autentimist" button
    await page.click(`button.btn--secondary:has-text("${translations.askContactInformation}")`);

    // Get all chat messages
    const chatMessages = page.locator('div.active-chat__group.active-chat__group--event div.active-chat__event-message p');

    // Get last chat message that should be asking for authentication
    const lastMessage = chatMessages.last();

    // Verify the chat event message content
    await expect(lastMessage).toHaveText(new RegExp(translations.askedContactInformation));
});


test('click "Küsi nõusolekut" button and verify chat event', async ({ page }) => {
    await takeOverFirstChat(page);

    // Click on the "Küsi nõusolekut" button
    await page.click(`button.btn--secondary:has-text("${translations.askPermission}")`);

    // Get all chat messages
    const chatMessages = page.locator('div.active-chat__group.active-chat__group--event div.active-chat__event-message p');

    // Get last chat message that should be asking for authentication
    const lastMessage = chatMessages.last();

    // Verify the chat event message content
    await expect(lastMessage).toHaveText(new RegExp(translations.askedPermission));
});


// Test cases
test('should not send more than 1 event message when "Küsi autentimist" button is clicked', async ({ page }) => {
    await testEventMessageCount(page, translations.askAuthentication, translations.askedAuthentication);
});

test('should not send more than 1 event message when "Küsi kontaktandmeid" button is clicked', async ({ page }) => {
    await testEventMessageCount(page, translations.askContactInformation, translations.askedContactInformation);
});

test('should not send more than 1 event message when "Küsi nõusolekut" button is clicked', async ({ page }) => {
    await testEventMessageCount(page, translations.askPermission, translations.askedPermission);
});


// Helper function to test event message count increment
async function testEventMessageCount(page, buttonText, messageText) {
    await takeOverFirstChat(page);

    // Get initial messages count
    const initialMessageCount = await page.locator(`div.active-chat__group.active-chat__group--event div.active-chat__event-message p:has-text("${messageText}")`).count();

    // Click on the button
    await page.click(`button.btn--secondary:has-text("${buttonText}")`);

    // Get the count of event messages after clicking the button
    const finalMessageCount = await page.locator(`div.active-chat__group.active-chat__group--event div.active-chat__event-message p:has-text("${messageText}")`).count();

    // Verify the chat event message content
    await expect(finalMessageCount).toBe(initialMessageCount + 1);
}












