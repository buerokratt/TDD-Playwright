const { test, expect } = require('@playwright/test');
const { getTranslations } = require('../../../../../../translations/languageDetector');

test.describe('Switch visibility and text tests', () => {
    let translation;
    let sameOnAllWorkingDaysState;
    let closedOnWeekendsState;

    test.beforeEach(async ({ page }) => {
        // Navigate to the page with a longer timeout
        await page.goto('https://admin.prod.buerokratt.ee/chat/working-time');

        // Check and store the initial state of the closedOnWeekends switch
        const closedOnWeekendsSwitch = page.locator('.switch').nth(2).locator('.switch__button');
        closedOnWeekendsState = await closedOnWeekendsSwitch.getAttribute('aria-checked') === 'true';
        
        const sameOnAllWorkingDaysSwitch = page.locator('.switch').nth(3).locator('.switch__button');
        sameOnAllWorkingDaysState = await sameOnAllWorkingDaysSwitch.getAttribute('aria-checked') === 'true';

        // Update state if necessary
        if (sameOnAllWorkingDaysState) {
            await sameOnAllWorkingDaysSwitch.click();
            await page.waitForTimeout(1000); // Wait for 1 second for the state to update
        }

        if (closedOnWeekendsState) {
            await closedOnWeekendsSwitch.click();
            await page.waitForTimeout(1000); // Wait for 1 second for the state to update
        }

        // Fetch translations
        translation = await getTranslations(page);
    });

    test.afterEach(async ({ page }) => {
        // Turn the switches back to their original states
        const sameOnAllWorkingDaysSwitch = page.locator('.switch').nth(3).locator('.switch__button');
        if (sameOnAllWorkingDaysState) {
            await sameOnAllWorkingDaysSwitch.click();
            await page.waitForTimeout(1000); // Wait for 1 second for the state to update
        }

        const closedOnWeekendsSwitch = page.locator('.switch').nth(2).locator('.switch__button');
        if (closedOnWeekendsState) {
            await closedOnWeekendsSwitch.click();
            await page.waitForTimeout(1000); // Wait for 1 second for the state to update
        }
    });

    test('check for visibility of the header', async ({ page }) => {

        // Wait for the header to be visible
        await page.waitForSelector('h1', { state: 'visible', timeout: 15000 });

        // Check if the <h1> element is visible
        const header = page.locator('h1');
        await expect(header).toBeVisible();
        await expect(header).toHaveText(translation["organizationworkingTime"]);
    });

    test('check visibility and text of "considerPublicHolidays" switch', async ({ page }) => {
        // Wait for the switch to be visible
        await page.waitForSelector('.switch', { state: 'visible', timeout: 15000 });

        // Select the first switch (assuming it's the one for "considerPublicHolidays")
        const switchElem = page.locator('.switch').nth(1);

        // Wait for the label to be visible
        const labelElem = switchElem.locator('.switch__label');
        await labelElem.waitFor({ state: 'visible', timeout: 15000 });

        const label = await labelElem.textContent();

        // Check visibility
        await expect(switchElem).toBeVisible();

        // Check text content
        await expect(label?.trim()).toBe(translation["considerPublicHolidays"]);
    });

    test('check visibility and text of "closedOnWeekends" switch', async ({ page }) => {
        // Wait for the switch to be visible
        await page.waitForSelector('.switch', { state: 'visible', timeout: 15000 });

        // Select the second switch (assuming it's the one for "closedOnWeekends")
        const switchElem = page.locator('.switch').nth(2);

        // Wait for the label to be visible
        const labelElem = switchElem.locator('.switch__label');
        await labelElem.waitFor({ state: 'visible', timeout: 15000 });

        const label = await labelElem.textContent();

        // Check visibility
        await expect(switchElem).toBeVisible();

        // Check text content
        await expect(label?.trim()).toBe(translation["closedOnWeekends"]);
    });

    test('check visibility and text of "sameOnAllWorkingDays" switch', async ({ page }) => {
        // Wait for the switch to be visible
        await page.waitForSelector('.switch', { state: 'visible', timeout: 15000 });

        // Select the third switch (assuming it's the one for "sameOnAllWorkingDays")
        const switchElem = page.locator('.switch').nth(3);

        // Wait for the label to be visible
        const labelElem = switchElem.locator('.switch__label');
        await labelElem.waitFor({ state: 'visible', timeout: 15000 });

        const label = await labelElem.textContent();

        // Check visibility
        await expect(switchElem).toBeVisible();

        // Check text content
        await expect(label?.trim()).toBe(translation["sameOnAllWorkingDays"]);
    });

    async function checkDayVisibility(page, dayEt) {
        // Check the visibility of the day label
        const dayLabel = page.locator(`.Label.switch:has-text("${dayEt}")`);
        await expect(dayLabel).toBeVisible();

        // Check the visibility of the switch associated with the day
        const switchButton = dayLabel.locator('..').locator('.switch__button');
        await expect(switchButton).toBeVisible();

        // Check the visibility of the startTime input
        const startTimeInput = dayLabel.locator('..').locator('.startTime input[type="text"]');
        await expect(startTimeInput).toBeVisible();

        // Check the visibility of the endTime input
        const endTimeInput = dayLabel.locator('..').locator('.endTime input[type="text"]');
        await expect(endTimeInput).toBeVisible();
    }

    test('check visibility and translation of Monday', async ({ page }) => {
        await checkDayVisibility(page, translation["monday"]);
    });

    test('check visibility and translation of Tuesday', async ({ page }) => {
        await checkDayVisibility(page, translation["tuesday"]);
    });

    test('check visibility and translation of Wednesday', async ({ page }) => {
        await checkDayVisibility(page, translation["wednesday"]);
    });

    test('check visibility and translation of Thursday', async ({ page }) => {
        await checkDayVisibility(page, translation["thursday"]);
    });

    test('check visibility and translation of Friday', async ({ page }) => {
        await checkDayVisibility(page, translation["friday"]);
    });

    test('check visibility and translation of Saturday', async ({ page }) => {
        await checkDayVisibility(page, translation["saturday"]);
    });

    test('check visibility and translation of Sunday', async ({ page }) => {
        await checkDayVisibility(page, translation["sunday"]);
    });
});
