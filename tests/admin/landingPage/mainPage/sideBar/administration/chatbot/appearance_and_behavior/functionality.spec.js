import { test, expect } from '@playwright/test';
import { getTranslations } from '@translation/languageDetector.js'

test.describe('Functionality Tests for "Välimus ja käitumine"/"Appearance and Behaviour" Page', () => {

    let translation

    test.beforeEach(async ({ page }) => {
        await page.goto('https://admin.prod.buerokratt.ee/chat/chatbot/appearance');
        translation = await getTranslations(page)
        await page.waitForTimeout(3000);
    });

    test('Test Animation Duration Input', async ({ page }) => {
        const proactiveSecondsInput = await page.getByLabel(`${translation.widgetProactiveSeconds}`, { exact: true });
        await proactiveSecondsInput.fill('5')
        await expect(proactiveSecondsInput).toHaveValue('5');
    });

    test('Test Notification Switch Toggle', async ({ page }) => {
        const bubbleMessageSwitch = await page.getByRole('switch', { name: `${translation.widgetBubbleMessageText}` }).nth(0);
        if (await bubbleMessageSwitch.getAttribute('data-state') === 'checked') {
            await bubbleMessageSwitch.click();
        }
        await expect(bubbleMessageSwitch).toHaveAttribute('data-state', 'unchecked');
        await bubbleMessageSwitch.click();
        await expect(bubbleMessageSwitch).toHaveAttribute('data-state', 'checked');
    });

    test('Test Animation Start Time Input', async ({ page }) => {
        const bubbleMessageSecondsInput = await page.getByLabel(`${translation.widgetBubbleMessageSeconds}`, { exact: true });
        await bubbleMessageSecondsInput.fill('10');
        await expect(bubbleMessageSecondsInput).toHaveValue('10');
    });

    test('Test Notification Message Input', async ({ page }) => {
        const bubbleMessageTextInput = await page.getByText(`${translation.widgetBubbleMessageText}`).nth(1);
        await bubbleMessageTextInput.fill('Hello, welcome to the chatbot!');
        await expect(bubbleMessageTextInput).toHaveValue('Hello, welcome to the chatbot!');
    });

    test('Test Primary Color Picker', async ({ page }) => {
        const widgetColorInput = await page.getByLabel(`${translation.widgetColor}`, { exact: true });
        await widgetColorInput.click();
        const colorPickerInput = await page.getByLabel('hex');
        colorPickerInput.fill('#414181');
        await expect(widgetColorInput).toHaveValue('#414181');
    });

    test('Test Animation Dropdown', async ({ page }) => {
        await page.getByRole('combobox', { name: `${translation.widgetAnimation}` }).click();
        await page.getByRole('option', { name: 'Jump' }).click();
        await expect(page.getByRole('combobox', { name: 'Widget animation' })).toBeVisible();
    });

    test('Test "Eelvaade"/"Preview" Button Functionality', async ({ page }) => {
        await page.getByText(`${translation.preview}`, { exact: true }).click();
        const mockWidget = page.locator('img[alt="Buerokratt logo"]');
        await expect(mockWidget).toBeVisible();
    });

    test('Check functionality of all fields and "Eelvaade" button', async ({ page }) => {
        // Fill in the animation duration
        const proactiveSecondsInput = await page.getByLabel(`${translation.widgetProactiveSeconds}`, { exact: true });
        await proactiveSecondsInput.fill('5')

        // Toggle the notification switch
        const bubbleMessageSwitch = await page.getByRole('switch', { name: `${translation.widgetBubbleMessageText}` }).nth(0);
        if (await bubbleMessageSwitch.getAttribute('data-state') === 'unchecked') {
            await bubbleMessageSwitch.click();
        }

        // Fill in the animation start time
        const bubbleMessageSecondsInput = await page.getByLabel(`${translation.widgetBubbleMessageSeconds}`, { exact: true });
        await bubbleMessageSecondsInput.fill('1');

        // Fill in the notification message
        const bubbleMessageTextInput = await page.getByText(`${translation.widgetBubbleMessageText}`).nth(1);
        await bubbleMessageTextInput.fill('Hello, welcome to the chatbot!');

        // Select widget color
        const widgetColorInput = await page.getByLabel(`${translation.widgetColor}`, { exact: true });
        await widgetColorInput.click();
        const colorPickerInput = await page.getByLabel('hex');
        colorPickerInput.fill('#414181');

        // Select from the dropdown
        await page.getByRole('combobox', { name: `${translation.widgetAnimation}` }).click();
        await page.getByRole('option', { name: 'Jump' }).click();

        // Click preview button
        await page.getByText(`${translation.preview}`, { exact: true }).click();

        await page.waitForTimeout(5000);

        const mockWidget = await page.getByAltText('Buerokratt logo');
        await expect(mockWidget).toBeVisible();

        if (bubbleMessageSwitch.getAttribute('data-state') === 'checked') {
            await expect(mockWidget.locator('.profile__greeting-message.profile__greeting-message--active')).toHaveText(bubbleMessageTextInput);
        } else {
            // If the switch is off, ensure the message is not visible
            await expect(mockWidget.locator('.profile__greeting-message.profile__greeting-message--active')).not.toBeVisible();
        }

        // Verify Animation Class for 'Jump'
        const animatedWidget = page.locator('.profile--jump');
        await expect(animatedWidget).toBeVisible();

        await expect(animatedWidget).toHaveCSS('background-color', 'rgb(65, 65, 129)');
        await expect(animatedWidget).toHaveCSS('animation-iteration-count', '5');
    });
});