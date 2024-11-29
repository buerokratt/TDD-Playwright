import { test, expect } from '@playwright/test';
import { getTranslations } from '@translation/languageDetector.js';
import {
    turnSwitchOn,
    changeOpenHoursTo24and7,
    provideData,
    selectFirstItem,
    
} from './helper';

let translation;

test.describe('Buerokratt-Chatbot Functionality Testing', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('https://admin.prod.buerokratt.ee/chat/unanswered');
        test.info().annotations.push({ type: 'repository', description: 'Buerokratt-Chatbot' }); 
        await page.waitForTimeout(1000);
        await turnSwitchOn(page);
        await changeOpenHoursTo24and7();
        await provideData();
        await selectFirstItem(page);
        translation = await getTranslations(page);


    });

    test('should display unanswered chats header with dynamic count', async ({ page }) => {
        const header = page.locator('.vertical-tabs__group-header');
        await expect(header).toHaveText(new RegExp(`${translation.unansweredChats}`));
    });

    test('should display end chat dialog when end chat button clicked and interact with chat management actions', async ({ page }) => {
        const toolbar = page.locator('.active-chat__toolbar');
        const takeOverButton = toolbar.getByRole('button', { name: `${translation.takeOver}`, exact: true });
        await expect(takeOverButton).toBeVisible();
        await takeOverButton.click();

        const sideActions = page.locator('.active-chat__side-actions');
        const endChatButton = sideActions.getByRole('button', { name: `${translation.endChat}`, exact: true });
        const forwardToColleagueButton = sideActions.getByRole('button', { name: `${translation.forwardToColleague}`, exact: true });

        await expect(endChatButton).toBeVisible();
        await expect(forwardToColleagueButton).toBeVisible();
        await endChatButton.click();

        const endChatDialog = page.locator('.dialog');
        const endChatDialogHeader = page.locator('.dialog__header');
        await expect(endChatDialogHeader).toContainText(`${translation.chooseChatStatus}`);

        const radioOption = await page.getByText(`${translation.acceptedResponse}`, { exact: true });
        await radioOption.click();

        const cancelButton = page.locator('.dialog__footer').getByRole('button', { name: `${translation.cancel}`, exact: true });
        const confirmEndChatButton = page.locator('.dialog__footer').getByRole('button', { name: `${translation.endChat}`, exact: true });

        await expect(cancelButton).toBeVisible();
        await expect(confirmEndChatButton).toBeVisible();

        await confirmEndChatButton.click();
        await expect(endChatDialog).not.toBeVisible();
        const successMessage = page.locator('.toast--success');
        await expect(successMessage).toBeVisible();
    });



    test('Should activate chat, when take over button is clicked', async ({ page }) => {
        const takeOverButton = await page.getByRole('button', { name: `${translation.takeOver}`, exact: true });
       
        await expect(takeOverButton).toBeVisible();
        await takeOverButton.click();
        
        const sideActionsButtons = page.locator('.active-chat__side-actions button');
        const sideButtonsCount = await sideActionsButtons.count();

        for (let i = 0; i < sideButtonsCount; i++) {
            const button = sideActionsButtons.nth(i);
            await expect(button).not.toHaveClass(/btn--disabled/);
        }

        const textarea = page.getByPlaceholder(`${translation.reply}`, { exact: true });
        const sendButton = page.locator('#myButton');
        await expect(textarea).toBeVisible();
        await expect(sendButton).toBeVisible();
    })


    test('Should be able to type text in chat input field', async ({ page }) => {
        const takeOverButton = await page.getByRole('button', { name: `${translation.takeOver}`, exact: true });
        await expect(takeOverButton).toBeVisible();
        await takeOverButton.click();

        const textarea = page.getByPlaceholder(`${translation.reply}`, { exact: true });
        await expect(textarea).toBeVisible();

        const inputValue = 'Test input value';
        await textarea.fill(inputValue);
        await expect(textarea).toHaveValue(inputValue);
    
    })


    test('should handle forward to colleague functionality', async ({ page }) => {
        const p = page.locator('header .track p');
        const firstStrong1 = p.locator('strong').first();

        const forwardChat1 = page.getByText(`${translation.forwardToColleague}`)
        await forwardChat1.click();

        const forwardButton = page.getByRole('button', { name: `${translation.forward}`, exact: true }).first();

        await forwardButton.click();

        const firstStrong2 = p.locator('strong').first();

        await expect(firstStrong1).not.toBe(firstStrong2);

    });

    test('Verify that text appears in chat after sending button clicked', async ({ page }) => {

        const takeOverButton = await page.getByRole('button', { name: `${translation.takeOver}`, exact: true });
        await expect(takeOverButton).toBeVisible();
        await takeOverButton.click();
    
        const textarea = page.getByPlaceholder(`${translation.reply}`, { exact: true });
        await expect(textarea).toBeVisible();
        const message = 'Hello, this is a test message!';
        await textarea.fill(message);
    
        const sendButton = page.locator('#myButton');
        await expect(sendButton).toBeVisible();
        await sendButton.click();
        await page.waitForTimeout(1000);
    
        const chatMessage = page.locator('.active-chat__message-text div').last();
        await expect(chatMessage).toHaveText(message);
    });

    test('click ask authentication button and verify chat event', async ({ page }) => {
        const takeOverButton = await page.getByRole('button', { name: `${translation.takeOver}`, exact: true });
        await expect(takeOverButton).toBeVisible();
        await takeOverButton.click();
        
        const askAuthenticationButton = await page.getByRole('button', { name: `${translation.askForAuthentication}`, exact: true });
        await expect(askAuthenticationButton).toBeVisible();
        await askAuthenticationButton.click();
        await page.waitForTimeout(1000);

        // Get all chat messages
        const chatMessages = page.locator('.active-chat__event-message p');
    
        // Get last chat message that should be asking for authentication
        const lastMessage = chatMessages.last();
    
        await expect(lastMessage).toHaveText(new RegExp(translation.requestedAuthentication));
    });

    test('click ask for contact information button and verify chat event', async ({ page }) => {
        const takeOverButton = await page.getByRole('button', { name: `${translation.takeOver}`, exact: true });
        await expect(takeOverButton).toBeVisible();
        await takeOverButton.click();
        
        const askContactInfromationButton = await page.getByRole('button', { name: `${translation.askContactInformation}`, exact: true });
        await expect(askContactInfromationButton).toBeVisible();
        await askContactInfromationButton.click();
        await page.waitForTimeout(1000);

        // Get all chat messages
        const chatMessages = page.locator('.active-chat__event-message p');
    
        // Get last chat message that should be asking for authentication
        const lastMessage = chatMessages.last();
    
        await expect(lastMessage).toHaveText(new RegExp(translation.askedContactInformation));
    });
    

    test('click ask permission button and verify chat event', async ({ page }) => {
        const takeOverButton = await page.getByRole('button', { name: `${translation.takeOver}`, exact: true });
        await expect(takeOverButton).toBeVisible();
        await takeOverButton.click();
        
        const askPermissionButton = await page.getByRole('button', { name: `${translation.askPermission}`, exact: true });
        await expect(askPermissionButton).toBeVisible();
        await askPermissionButton.click();
        await page.waitForTimeout(1000);

        // Get all chat messages
        const chatMessages = page.locator('.active-chat__event-message p');
    
        // Get last chat message that should be asking for authentication
        const lastMessage = chatMessages.last();
    
        await expect(lastMessage).toHaveText(new RegExp(translation.askedPermission));
    });

    test('should not send more than 1 event message when ask authentication button is clicked', async ({ page }) => {
        test.setTimeout(40000)
        await testEventMessageCount(page, translation.askForAuthentication, translation.askedAuthentication);
    });
    
    test('should not send more than 1 event message when ask for contact information button is clicked', async ({ page }) => {
        test.setTimeout(40000)
        await testEventMessageCount(page, translation.askContactInformation, translation.askedContactInformation);
    });
    
    test('should not send more than 1 event message when ask permission button is clicked', async ({ page }) => {
        test.setTimeout(40000)
        await testEventMessageCount(page, translation.askPermission, translation.askedPermission);
    });
    

    test('should validate table sorting and searching functionality', async ({ page }) => {
        const forwardChat = page.getByText(`${translation.forwardToColleague}`)
        await forwardChat.click();

        const tableHeaders = page.locator('table thead tr th');
        await expect(tableHeaders).toHaveCount(4);
        const rows = page.locator('table tbody tr');

        const headerCount = await tableHeaders.count();
        for (let i = 0; i < headerCount - 1; i++) {
            const header = tableHeaders.nth(i);
            const button = header.locator('button').first();
            await button.click();
            await page.waitForTimeout(1000);

            const ascendingOrder = await getColumnValues(rows, i);
            const sortedAscending = [...ascendingOrder].sort((a, b) => a.localeCompare(b));
            await expect(ascendingOrder).toEqual(sortedAscending);

            await button.click();
            await page.waitForTimeout(1000);

            const descendingOrder = await getColumnValues(rows, i);
            const sortedDescending = [...descendingOrder].sort((a, b) => b.localeCompare(a));
            await expect(descendingOrder).toEqual(sortedDescending);
        }

        async function getColumnValues(rows, columnIndex) {
            const values = [];
            for (let i = 0; i < await rows.count(); i++) {
                const row = rows.nth(i);
                const cell = row.locator('td').nth(columnIndex);
                values.push((await cell.innerText()).trim());
            }
            return values;
        }
    });

    test('should validate search functionality in table', async ({ page }) => {
        const forwardChat = page.getByText(`${translation.forwardToColleague}`);
        await forwardChat.click();

        const rows = page.locator('table tbody tr');
        const headers = ['Name', 'Display name', 'Status'];

        for (let i = 0; i < headers.length; i++) {

            const searchInput = page.getByPlaceholder(`${translation.searchByName}`);
            const firstRowValue = (await rows.first().locator('td').nth(0).innerText()).trim();

            await searchInput.fill(firstRowValue);
            await page.waitForTimeout(1000);

            const filteredRowValue = (await rows.first().locator('td').nth(0).innerText()).trim();
            await expect(filteredRowValue).toBe(firstRowValue);
            await expect(await rows.count()).toBe(1)

            await searchInput.fill('');
            await page.waitForTimeout(1000);
        }
    });


    async function testEventMessageCount(page, buttonText, messageText) {
        const takeOverButton = await page.getByRole('button', { name: `${translation.takeOver}`, exact: true });
        await expect(takeOverButton).toBeVisible();
        await takeOverButton.click();
    
    
        // Get initial messages count
        const initialMessageCount = await page.locator(`.active-chat__event-message p:has-text("${messageText}")`).count();
    
        await page.getByRole('button', { name: `${buttonText}`, exact: true }).click();
        
        const finalMessageCount = await page.locator(`.active-chat__event-message p:has-text("${messageText}")`).count();
    
        await expect(finalMessageCount).toBe(initialMessageCount + 1);
    }
}
);


