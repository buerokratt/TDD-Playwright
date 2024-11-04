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
        await page.locator('.saturation-black').click();
        await expect(widgetColorInput).toHaveValue('#414181');
    });

    test('Test Animation Dropdown', async ({ page }) => {
        await page.getByRole('combobox', { name: `${translation.widgetAnimation}` }).click();
        await page.getByRole('option', { name: 'Jump' }).click();
        await expect(page.getByRole('combobox', { name: 'Widget animation' })).toBeVisible();
    });

    test('Test "Eelvaade"/"Preview" Button Functionality', async ({ page }) => {
        await page.getByText(`${translation.preview}`, { exact: true }).click();
        //page.getByAltText('Buerokratt logo').click();
        const mockWidget = page.locator('img[alt="Buerokratt logo"]');
        await expect(mockWidget).toBeVisible();
    });

    let originalStates = {};

    test.beforeEach(async ({ page }) => {
        test.info().annotations.push({
            type: 'Test working condition',
            description: 'Currently this test passes when the notification message is turned on by default. Since the aforementioned bug runs throught all of the tests and pages, it would be better to focus on this after the bug is fixed.',
        })

        // Capture original states of all inputs and switches using more reliable selectors
        originalStates.animationDuration = await page.locator('input[name="widgetProactiveSeconds"]').inputValue();
        originalStates.notificationSwitch = await page.locator('button.switch__button[aria-checked]').nth(1).getAttribute('aria-checked');
        originalStates.animationStartTime = await page.locator('input[name="widgetDisplayBubbleMessageSeconds"]').inputValue();
        originalStates.notificationMessage = await page.locator('input[name="widgetBubbleMessageText"]').inputValue();
        originalStates.primaryColor = await page.locator('input[name="widgetColor"]').inputValue();
        const dropdownTrigger = page.locator('div.select__trigger');
        originalStates.animationDropdown = await dropdownTrigger.textContent();
    });

    test('Check functionality of all fields and "Eelvaade" button', async ({ page }) => {
        function rgbToHex(rgb) {
            const [r, g, b] = rgb.match(/\d+/g).map(Number);
            return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
        }

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
        await bubbleMessageSecondsInput.fill('10');

        // Fill in the notification message
        const bubbleMessageTextInput = await page.getByText(`${translation.widgetBubbleMessageText}`).nth(1);
        await bubbleMessageTextInput.fill('Hello, welcome to the chatbot!');

        // Select widget color
        const widgetColorInput = await page.getByLabel(`${translation.widgetColor}`, { exact: true });
        await widgetColorInput.click();
        await page.locator('.saturation-black').click();

        // Select from the dropdown
        await page.getByRole('combobox', { name: `${translation.widgetAnimation}` }).click();
        await page.getByRole('option', { name: 'Jump' }).click();
        
        // Click preview button
        await page.getByText(`${translation.preview}`, { exact: true }).click();

        const mockWidget = await page.getByAltText('Buerokratt logo');
        await expect(mockWidget).toBeVisible();

        if (newNotificationState === 'true') {
            // Verify the mock widget reflects the new settings if the switch is enabled
            await expect(mockWidget.locator('.profile__greeting-message.profile__greeting-message--active')).toHaveText(newNotificationMessage);
        } else {
            // If the switch is off, ensure the message is not visible
            await expect(mockWidget.locator('.profile__greeting-message.profile__greeting-message--active')).not.toBeVisible();
        }

        const parentDiv = await mockWidget.evaluateHandle(el => el.parentElement);

        await page.waitForTimeout(6000);

        // Check other properties (background color, animation, etc.)
        const backgroundColor = await parentDiv.evaluate(el => window.getComputedStyle(el).backgroundColor);
        expect(rgbToHex(backgroundColor)).toBe('#FF0000');

        // Get animation-iteration-count
        const animationIterationCount = await parentDiv.evaluate(el => window.getComputedStyle(el).animationIterationCount);
        expect(animationIterationCount).toBe('5');

        const hasAnimationClass = await page.locator('div.profile.profile--jump').count() > 0;
        expect(hasAnimationClass).toBe(true);
    });
});