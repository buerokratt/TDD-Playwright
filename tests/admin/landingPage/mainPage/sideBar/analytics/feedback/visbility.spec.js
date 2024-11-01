const { test, expect } = require('@playwright/test');
const { getTranslations } = require('../../../../../../translations/languageDetector');

test.describe('Metrics Cards Visibility Test', () => {

    let translation;

    test.beforeEach(async ({ page }) => {
        test.info().annotations.push({ type: 'repository', description: 'Analytics-Module' });
        await page.goto('https://admin.prod.buerokratt.ee/analytics/feedback');
        translation = await getTranslations(page);
    });

    test('Check h1 header visibility', async ({ page }) => {
        const h1 = await page.locator('h1');
        await expect(h1).toBeVisible();
        await expect(h1).toHaveText(translation.feedback);
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

    test('Check visibility of completed statuses / number of conversations', async ({ page }) => {
        const section = page.locator(`section:has-text("${translation.chooseAMetric}")`);
        const completedStatusButton = section.locator(`button:has-text("${translation.completedStatuses}")`);
        await expect(completedStatusButton).toBeVisible();
    });

    test('Check visibility of "Feedback on Bürokrat conversations" button in metric section', async ({ page }) => {
        const section = page.locator(`section:has-text("${translation.chooseAMetric}")`);
        const conversationsButton = section.locator(`button:has-text("${translation.feedbackOnBureaucratConversations}")`);
        await expect(conversationsButton).toBeVisible();
    });

    test('Check visibility of "Feedback on advisor conversations" button in metric section', async ({ page }) => {
        const section = page.locator(`section:has-text("${translation.chooseAMetric}")`);
        const feedbackButton = section.locator(`button:has-text("${translation.feedbackOnAdvisorConversations}")`);
        await expect(feedbackButton).toBeVisible();
    });

    test('Check visibility of "Feedback to selected advisor" button in metric section', async ({ page }) => {
        const section = page.locator(`section:has-text("${translation.chooseAMetric}")`);
        const clientFeedbackButton = section.locator(`button:has-text("${translation.feedbackToSelectedAdvisor}")`);
        await expect(clientFeedbackButton).toBeVisible();
    });

    test('Check visibility of "Conversations with negative feedback" button in metric section', async ({ page }) => {
        const section = page.locator(`section:has-text("${translation.chooseAMetric}")`);
        const clientFeedbackButton = section.locator(`button:has-text("${translation.conversationsWithNegativeFeedback}")`);
        await expect(clientFeedbackButton).toBeVisible();
    });

    test('Check visibility of "Additional Options" section button in additional options section', async ({ page }) => {
        const section = page.locator(`.card__body .additional-option-label:has-text("${translation.additionalOptions}")`);
        await expect(section).toBeVisible();
    });

    test('Check visibility of "Additional Options" section Bureaucrat - the client left with an answer in additional options section', async ({ page }) => {
        const section = page.locator(`section:has-text("${translation.additionalOptions}")`);
        await expect(section).toBeVisible();

        const bureaucratClientLeftWithAnswer = section.locator('label').filter({ hasText: `${translation.bureaucratClientLeftWithAnswer}` });
        await expect(bureaucratClientLeftWithAnswer).toBeVisible();
    });

    test('Check visibility of "Additional Options" section Bureaucrat - the client left without an answer in additional options section', async ({ page }) => {
        const section = page.locator(`section:has-text("${translation.additionalOptions}")`);
        await expect(section).toBeVisible();

        const bureaucratClientLeftWithoutAnswer = section.locator('label').filter({ hasText: `${translation.bureaucratClientLeftWithoutAnswer}` });
        await expect(bureaucratClientLeftWithoutAnswer).toBeVisible();
    });

    test('Check visibility of "Additional Options" section Bureaucrat - terminated for an unspecified reason in additional options section', async ({ page }) => {
        const section = page.locator(`section:has-text("${translation.additionalOptions}")`);
        await expect(section).toBeVisible();

        const bureaucratTerminatedForUnspecifiedReason = section.locator('label').filter({ hasText: `${translation.bureaucratTerminatedForUnspecifiedReason}` });
        await expect(bureaucratTerminatedForUnspecifiedReason).toBeVisible();
    });

    test('Check visibility of "Additional Options" section Advisor - accepted answer in additional options section', async ({ page }) => {
        const section = page.locator(`section:has-text("${translation.additionalOptions}")`);
        await expect(section).toBeVisible();

        const advisorAcceptedAnswer = section.locator('label').filter({ hasText: `${translation.advisorAcceptedAnswer}` });
        await expect(advisorAcceptedAnswer).toBeVisible();
    });

    test('Check visibility of "Additional Options" section Advisor - signs of hate speech in additional options section', async ({ page }) => {
        const section = page.locator(`section:has-text("${translation.additionalOptions}")`);
        await expect(section).toBeVisible();

        const advisorSignsOfHateSpeech = section.locator('label').filter({ hasText: `${translation.advisorSignsOfHateSpeech}` });
        await expect(advisorSignsOfHateSpeech).toBeVisible();
    });

    test('Check visibility of "Additional Options" section Advisor - other reasons in additional options section', async ({ page }) => {
        const section = page.locator(`section:has-text("${translation.additionalOptions}")`);
        await expect(section).toBeVisible();

        const advisorOtherReasons = section.locator('label').filter({ hasText: `${translation.advisorOtherReasons}` });
        await expect(advisorOtherReasons).toBeVisible();
    });

    test('Check visibility of "Additional Options" section Advisor - answered in another channel in additional options section', async ({ page }) => {
        const section = page.locator(`section:has-text("${translation.additionalOptions}")`);
        await expect(section).toBeVisible();

        const advisorAnsweredInAnotherChannel = section.locator('label').filter({ hasText: `${translation.advisorAnsweredInAnotherChannel}` });
        await expect(advisorAnsweredInAnotherChannel).toBeVisible();
    });

    test('Check visibility of card header in additional options section', async ({ page }) => {
        const section = page.locator(`.card .title:has-text("${translation.completedStatuses}")`);
        await expect(section).toBeVisible();
    });

    test('Check visibility of card other content in additional options section', async ({ page }) => {
        const section = page.locator(`.card:has-text("${translation.completedStatuses}")`);
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
