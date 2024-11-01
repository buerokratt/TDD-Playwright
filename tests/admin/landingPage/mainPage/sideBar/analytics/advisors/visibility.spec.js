const { test, expect } = require('@playwright/test');
const { getTranslations } = require('../../../../../../translations/languageDetector');

test.describe('Metrics Cards Visibility Test', () => {
    let translation;

    test.beforeEach(async ({ page }) => {
    test.info().annotations.push({ type: 'repository', description: 'Analytics-Module' });
        await page.goto('https://admin.prod.buerokratt.ee/analytics/advisors');
        translation = await getTranslations(page);
    });

    test('Check h1 header visibility', async ({ page }) => {
        const h1 = await page.locator('h1');
        await expect(h1).toBeVisible();
        await expect(h1).toHaveText(translation.advisors);
    });

    test('Check visibility of "Period" section button in period section', async ({ page }) => {
        const section = page.locator(`.card__body .option-label:has-text("${translation.period}")`);
        await expect(section).toBeVisible();
    });

    test('Check visibility of "Today" button in period section', async ({ page }) => {
        const section = page.locator(`section:has-text("${translation.period}")`);
        const todayButton = section.locator(`button:has-text("${translation.today}")`);
        await expect(todayButton).toBeVisible();
    });

    test('Check visibility of "Yesterday" button in period section', async ({ page }) => {
        const section = page.locator(`section:has-text("${translation.period}")`);
        const yesterdayButton = section.locator(`button:has-text("${translation.yesterday}")`);
        await expect(yesterdayButton).toBeVisible();
    });

    test('Check visibility of "Last 30 Days" button in period section', async ({ page }) => {
        const section = page.locator(`section:has-text("${translation.period}")`);
        const last30DaysButton = section.locator(`button:has-text("${translation.last30Days}")`);
        await expect(last30DaysButton).toBeVisible();
    });

    test('Check visibility of "Selected Months" button in period section', async ({ page }) => {
        const section = page.locator(`section:has-text("${translation.period}")`);
        const selectedMonthsButton = section.locator(`button:has-text("${translation.selectedMonths}")`);
        await expect(selectedMonthsButton).toBeVisible();
    });

    test('Check visibility of "Selected Period" button in period section', async ({ page }) => {
        const section = page.locator(`section:has-text("${translation.period}")`);
        const selectedPeriodButton = section.locator(`button:has-text("${translation.selectedPeriod}")`);
        await expect(selectedPeriodButton).toBeVisible();
    });

    test('Check visibility of "Choose a metric" section button in metric section', async ({ page }) => {
        const section = page.locator(`.card__body .option-label:has-text("${translation.chooseAMetric}")`);
        await expect(section).toBeVisible();
    });

    test('Check visibility of "Forwarding" button in metric section', async ({ page }) => {
        const section = page.locator(`section:has-text("${translation.chooseAMetric}")`);
        const totalAdvisorsButton = section.locator(`button:has-text("${translation.forwarding}")`);
        await expect(totalAdvisorsButton).toBeVisible();
    });

    test('Check visibility of "Average response speed in the institution" button in metric section', async ({ page }) => {
        const section = page.locator(`section:has-text("${translation.chooseAMetric}")`);
        const averageResponseSpeedInTheInstitution = section.locator(`button:has-text("${translation.averageResponseSpeedInTheInstitution}")`);
        await expect(averageResponseSpeedInTheInstitution).toBeVisible();
    });

    test('Check visibility of "Average presence of counselors" button in metric section', async ({ page }) => {
        const section = page.locator(`section:has-text("${translation.chooseAMetric}")`);
        const averagePresenceOfCounselors = section.locator(`button:has-text("${translation.averagePresenceOfCounselors}")`);
        await expect(averagePresenceOfCounselors).toBeVisible();
    });

    test('Check visibility of "Number of conversations by adviser" button in metric section', async ({ page }) => {
        const section = page.locator(`section:has-text("${translation.chooseAMetric}")`);
        const numberOfConversationsByAdviser = section.locator(`button:has-text("${translation.numberOfConversationsByAdviser}")`);
        await expect(numberOfConversationsByAdviser).toBeVisible();
    });

    test('Check visibility of "Conversation time by advisor" button in metric section', async ({ page }) => {
        const section = page.locator(`section:has-text("${translation.chooseAMetric}")`);
        const conversationTimeByAdvisor = section.locator(`button:has-text("${translation.conversationTimeByAdvisor}")`);
        await expect(conversationTimeByAdvisor).toBeVisible();
    });

    test('Check visibility of "Additional Options" section button in additional options section', async ({ page }) => {
        const section = page.locator(`.card__body .additional-option-label:has-text("${translation.additionalOptions}")`);
        await expect(section).toBeVisible();
    });

    test('Check visibility of "Additional Options" section Bureaucrat - the client left with an answer in additional options section', async ({ page }) => {
        const section = page.locator(`section:has-text("${translation.additionalOptions}")`);
        await expect(section).toBeVisible();

        const numberOfConversationsDirectedFromAdvisor = section.locator('label').filter({ hasText: `${translation.numberOfConversationsDirectedFromAdvisor}` });
        await expect(numberOfConversationsDirectedFromAdvisor).toBeVisible();
    });

    test('Check visibility of "Additional Options" section Bureaucrat - the client left without an answer in additional options section', async ({ page }) => {
        const section = page.locator(`section:has-text("${translation.additionalOptions}")`);
        await expect(section).toBeVisible();

        const counselorDirectedConversations = section.locator('label').filter({ hasText: `${translation.counselorDirectedConversations}` });
        await expect(counselorDirectedConversations).toBeVisible();
    });

    test('Check visibility of "Additional Options" section Bureaucrat - terminated for an unspecified reason in additional options section', async ({ page }) => {
        const section = page.locator(`section:has-text("${translation.additionalOptions}")`);
        await expect(section).toBeVisible();

        const outOfFacilityForwards = section.locator('label').filter({ hasText: `${translation.outOfFacilityForwards}` });
        await expect(outOfFacilityForwards).toBeVisible();
    });

    test('Check visibility of card header in additional options section', async ({ page }) => {
        const section = page.locator(`.card .title:has-text("${translation.forwarding}")`);
        await expect(section).toBeVisible();
    });

    test('Check visibility of card other content in additional options section', async ({ page }) => {
        const section = page.locator(`.card:has-text("${translation.forwarding}")`);
        const otherContent = section.locator('.other_content');

        await expect(otherContent).toBeVisible();

        const downloadButton = otherContent.locator('button:has-text("CSV")');
        await expect(downloadButton).toBeVisible();

        const dropDownMenu = otherContent.locator('.select__wrapper');
        await expect(dropDownMenu).toBeVisible();

        await dropDownMenu.click();

        const barChart = dropDownMenu.locator(`.select__option:has-text("${translation.barChart}")`);
        await expect(barChart).toBeVisible();

        const pieChart = dropDownMenu.locator(`.select__option:has-text("${translation.pieChart}")`);
        await expect(pieChart).toBeVisible();
    });
});