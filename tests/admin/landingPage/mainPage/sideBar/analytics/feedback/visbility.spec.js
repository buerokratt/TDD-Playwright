import { test, expect } from '@playwright/test';
import { getTranslations } from '@translation/languageDetector.js';

let translation;

test.describe('Analytics-Module Visibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://admin.prod.buerokratt.ee/analytics/feedback');
    translation = await getTranslations(page);
    test.info().annotations.push({ type: 'repository', description: 'Analytics-Module' });
    await page.waitForTimeout(3000);
  });

  test('Validate Main Heading', async ({ page }) => {
    const heading = await page.getByRole('heading', { name: `${translation.feedback}`, exact: true });
    await expect(heading).toBeVisible();
  });

  test('Validate Period Buttons in Card Section', async ({ page }) => {
    const cardBody = page.locator('.card__body').filter({ hasText: `${translation.period}` });
    const todayButton = cardBody.getByRole('button', { name: `${translation.today}`, exact: true });
    const yesterdayButton = cardBody.getByRole('button', { name: `${translation.yesterday}`, exact: true });
    const last30DaysButton = cardBody.getByRole('button', { name: `${translation.last30Days}`, exact: true });
    const selectedMonthsButton = cardBody.getByRole('button', { name: `${translation.selectedMonths}`, exact: true });
    const selectedPeriodButton = cardBody.getByRole('button', { name: `${translation.selectedPeriod}`, exact: true });

    await expect(todayButton).toBeVisible();
    await expect(yesterdayButton).toBeVisible();
    await expect(last30DaysButton).toBeVisible();
    await expect(selectedMonthsButton).toBeVisible();
    await expect(selectedPeriodButton).toBeVisible();
  });

  test('Validate Datepickers with Selected Period Button', async ({ page }) => {
    const cardBody = page.locator('.card__body').filter({ hasText: `${translation.period}` });
    const selectedPeriodButton = cardBody.getByRole('button', { name: `${translation.selectedPeriod}`, exact: true });
    await selectedPeriodButton.click();
    const startDatePicker = cardBody.locator('.datepicker').nth(0);
    const endDatePicker = cardBody.locator('.datepicker').nth(1);

    await expect(startDatePicker).toBeVisible();
    await expect(endDatePicker).toBeVisible();
  });

  test('Validate Metrics Section Buttons', async ({ page }) => {
    const metricsSection = page.locator('.card__body').filter({ hasText: `${translation.chooseAMetric}` });
    const completedStatusesButton = metricsSection.getByRole('button', { name: `${translation.completedStatusesNumberOfConversations}`, exact: true });
    const feedbackOnBureaucratButton = metricsSection.getByRole('button', { name: `${translation.feedbackOnBureaucratConversations}`, exact: true });
    const feedbackOnAdvisorButton = metricsSection.getByRole('button', { name: `${translation.feedbackOnAdvisorConversations}`, exact: true });
    const feedbackToSelectedAdvisorButton = metricsSection.getByRole('button', { name: `${translation.feedbackToSelectedAdvisor}`, exact: true });
    const conversationsWithNegativeFeedbackButton = metricsSection.getByRole('button', { name: `${translation.conversationsWithNegativeFeedback}`, exact: true });

    await expect(completedStatusesButton).toBeVisible();
    await expect(feedbackOnBureaucratButton).toBeVisible();
    await expect(feedbackOnAdvisorButton).toBeVisible();
    await expect(feedbackToSelectedAdvisorButton).toBeVisible();
    await expect(conversationsWithNegativeFeedbackButton).toBeVisible();
  });

  test('Validate Additional Options Checkboxes', async ({ page }) => {
    const additionalOptionsSection = page.locator('.card__body').filter({ hasText: `${translation.additionalOptions}` });
    const checkbox1 = additionalOptionsSection.getByRole('checkbox', { name: `${translation.bureaucratClientLeftWithAnswer}`, exact: true });
    const checkbox2 = additionalOptionsSection.getByRole('checkbox', { name: `${translation.bureaucratClientLeftWithoutAnswer}`, exact: true });
    const checkbox3 = additionalOptionsSection.getByRole('checkbox', { name: `${translation.bureaucratTerminatedUnspecifiedReason}`, exact: true });
    const checkbox4 = additionalOptionsSection.getByRole('checkbox', { name: `${translation.advisorAcceptedAnswer}`, exact: true });
    const checkbox5 = additionalOptionsSection.getByRole('checkbox', { name: `${translation.advisorSignsOfHateSpeech}`, exact: true });
    const checkbox6 = additionalOptionsSection.getByRole('checkbox', { name: `${translation.advisorOtherReasons}`, exact: true });
    const checkbox7 = additionalOptionsSection.getByRole('checkbox', { name: `${translation.advisorAnsweredInAnotherChannel}`, exact: true });

    await expect(checkbox1).toBeVisible();
    await expect(checkbox2).toBeVisible();
    await expect(checkbox3).toBeVisible();
    await expect(checkbox4).toBeVisible();
    await expect(checkbox5).toBeVisible();
    await expect(checkbox6).toBeVisible();
    await expect(checkbox7).toBeVisible();
  });

  test('Validate Card Header for Completed Statuses', async ({ page }) => {
    const cardHeader = page.locator('.card__header').getByRole('heading', { name: `${translation.completedStatusesNumberOfConversations}`, exact: true });
    await expect(cardHeader).toBeVisible();
  });

  test('Validate Chart and CSV Button in Other Content', async ({ page }) => {
    const csvButton = page.getByRole('button', { name: `${translation.csv}`, exact: true });
    const dropdown = page.getByText(new RegExp(translation.barChart));
    const chart = page.locator('.recharts-wrapper');

    await expect(csvButton).toBeVisible();
    await expect(dropdown).toBeVisible();
    await expect(chart).toBeVisible();
  });
});
