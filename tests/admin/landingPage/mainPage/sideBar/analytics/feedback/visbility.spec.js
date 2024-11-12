import { test, expect } from '@playwright/test';
import { getTranslations } from '@translation/languageDetector.js';

let translation;

test.describe('Analytics-Module', () => {
  test.beforeEach(async ({ page }) => {
    test.info().annotations.push({ type: 'repository', description: 'Analytics-Module' });
    await page.goto('https://admin.prod.buerokratt.ee/analytics/feedback');
    await page.waitForTimeout(3000);
    translation = await getTranslations(page);
  });

  test.describe('Main Heading', () => {
    test('should display main heading', async ({ page }) => {
      const heading = await page.getByRole('heading', { name: `${translation.feedback}`, exact: true });
      await expect(heading).toBeVisible();
    });
  });

  test.describe('Card Body', () => {
    test('should display label for Period', async ({ page }) => {
      const periodLabel = await page.getByText(`${translation.period}`, { exact: true });
      await expect(periodLabel).toBeVisible();
    });

    test('should display Period buttons', async ({ page }) => {
      const todayButton = await page.getByText(`${translation.today}`, { exact: true });
      const yesterdayButton = await page.getByText(`${translation.yesterday}`, { exact: true });
      const last30DaysButton = await page.getByText(`${translation.last30Days}`, { exact: true });
      const selectedMonthsButton = await page.getByText(`${translation.selectedMonths}`, { exact: true });
      const selectedPeriodButton = await page.getByText(`${translation.selectedPeriod}`, { exact: true });

      await expect(todayButton).toBeVisible();
      await expect(yesterdayButton).toBeVisible();
      await expect(last30DaysButton).toBeVisible();
      await expect(selectedMonthsButton).toBeVisible();
      await expect(selectedPeriodButton).toBeVisible();
    });

    test('should display label for Choose a metric', async ({ page }) => {
      const chooseMetricLabel = await page.getByText(`${translation.chooseAMetric}`, { exact: true });
      await expect(chooseMetricLabel).toBeVisible();
    });

    test('should display metric buttons', async ({ page }) => {
      const completedStatusesButton = await page.getByRole('button', { name: `${translation.completedStatusesNumberOfConversations}`,  exact: true });
      const feedbackOnBureaucratButton = await page.getByText(`${translation.feedbackOnBureaucratConversations}`, { exact: true });
      const feedbackOnAdvisorButton = await page.getByText(`${translation.feedbackOnAdvisorConversations}`, { exact: true });
      const feedbackToSelectedAdvisorButton = await page.getByText(`${translation.feedbackToSelectedAdvisor}`, { exact: true });
      const negativeFeedbackButton = await page.getByText(`${translation.conversationsWithNegativeFeedback}`, { exact: true });

      await expect(completedStatusesButton).toBeVisible();
      await expect(feedbackOnBureaucratButton).toBeVisible();
      await expect(feedbackOnAdvisorButton).toBeVisible();
      await expect(feedbackToSelectedAdvisorButton).toBeVisible();
      await expect(negativeFeedbackButton).toBeVisible();
    });

    test('should display label for Additional Options', async ({ page }) => {
      const additionalOptionsLabel = await page.getByText(`${translation.additionalOptions}`, { exact: true });
      await expect(additionalOptionsLabel).toBeVisible();
    });

    test('should display checkbox options', async ({ page }) => {
      const bureaucratAnswerCheckbox = await page.getByText(`${translation.bureaucratTheClientLeftWithAnAnswer}`, { exact: true });
      const bureaucratWithoutAnswerCheckbox = await page.getByText(`${translation.bureaucratTheCustomerLeftWithoutAnAnswer}`, { exact: true });
      const bureaucratUnspecifiedCheckbox = await page.getByText(`${translation.bureaucratTerminatedForAnUnspecifiedReason}`, { exact: true });
      const advisorAcceptedCheckbox = await page.getByText(`${translation.advisorAcceptedAnswer}`, { exact: true });
      const advisorHateSpeechCheckbox = await page.getByText(`${translation.advisorSignsOfHateSpeech}`, { exact: true });
      const advisorOtherReasonsCheckbox = await page.getByText(`${translation.advisorOtherReasons}`, { exact: true });
      const advisorAnotherChannelCheckbox = await page.getByText(`${translation.advisorAnsweredInAnotherChannel}`, { exact: true });

      await expect(bureaucratAnswerCheckbox).toBeVisible();
      await expect(bureaucratWithoutAnswerCheckbox).toBeVisible();
      await expect(bureaucratUnspecifiedCheckbox).toBeVisible();
      await expect(advisorAcceptedCheckbox).toBeVisible();
      await expect(advisorHateSpeechCheckbox).toBeVisible();
      await expect(advisorOtherReasonsCheckbox).toBeVisible();
      await expect(advisorAnotherChannelCheckbox).toBeVisible();
    });
  });

  test.describe('Card Header', () => {
    test('should display heading for Completed statuses', async ({ page }) => {
      const completedStatusesHeading = await page.getByRole('heading', { name: `${translation.completedStatusesNumberOfConversations}`, exact: true });
      await expect(completedStatusesHeading).toBeVisible();
    });

    test('should display CSV button and dropdown', async ({ page }) => {
      const csvButton = await page.getByText(`${translation.csv}`, { exact: true });
      const chartDropdown = await page.locator('.select');

      await expect(csvButton).toBeVisible();
      await expect(chartDropdown).toBeVisible();
    });
  });
});
