const { test, expect } = require('@playwright/test');
const { getTranslations } = require('../../../../../../translations/languageDetector');

test.describe('Metrics Cards Visibility Test', () => {

  let translation;

  test.beforeEach(async ({ page }) => {
    test.info().annotations.push({ type: 'repository', description: 'Analytics-Module' });
    await page.goto('https://admin.prod.buerokratt.ee/analytics/chats');
    translation = await getTranslations(page);
  });

  test('Check h1 header visibility', async ({ page }) => {
    const h1 = await page.locator('h1');
    await expect(h1).toBeVisible();
    await expect(h1).toHaveText(translation.chats);
  });

  test('Check visibility of "Period" section button in period section', async ({ page }) => {
    const section = page.locator(`.card__body .option-label:has-text("${translation.period}")`);
    await expect(section).toBeVisible();
  });


  test('Check visibility of "Today" button in period section', async ({ page }) => {
    const section = page.locator(`div:has-text("${translation.period}")`);
    const todayButton = section.locator(`button:has-text("${translation.today}")`);
    await expect(todayButton).toBeVisible();
  });

  test('Check visibility of "Yesterday" button in period section', async ({ page }) => {
    const section = page.locator(`div:has-text("${translation.period}")`);
    const yesterdayButton = section.locator(`button:has-text("${translation.yesterday}")`);
    await expect(yesterdayButton).toBeVisible();
  });

  test('Check visibility of "Last 30 Days" button in period section', async ({ page }) => {
    const section = page.locator(`div:has-text("${translation.period}")`);
    const last30DaysButton = section.locator(`button:has-text("${translation.last30Days}")`);
    await expect(last30DaysButton).toBeVisible();
  });

  test('Check visibility of "Selected Months" button in period section', async ({ page }) => {
    const section = page.locator(`div:has-text("${translation.period}")`);
    const selectedMonthsButton = section.locator(`button:has-text("${translation.selectedMonths}")`);
    await expect(selectedMonthsButton).toBeVisible();
  });

  test('Check visibility of "Selected Period" button in period section', async ({ page }) => {
    const section = page.locator(`div:has-text("${translation.period}")`);
    const selectedPeriodButton = section.locator(`button:has-text("${translation.selectedPeriod}")`);
    await expect(selectedPeriodButton).toBeVisible();
  });

  test('Check visibility of "Choose a metric" section button in metric section', async ({ page }) => {
    const section = page.locator(`.card__body .option-label:has-text("${translation.chooseAMetric}")`);
    await expect(section).toBeVisible();
  });


  test('Check visibility of "Total number of chats" button in metric section', async ({ page }) => {
    const section = page.locator(`div:has-text("${translation.chooseAMetric}")`);
    const totalChatsButton = section.locator(`button:has-text("${translation.totalNumberOfChats}")`);
    await expect(totalChatsButton).toBeVisible();
  });

  test('Check visibility of "Contact information provided" button in metric section', async ({ page }) => {
    const section = page.locator(`div:has-text("${translation.chooseAMetric}")`);
    const contactInfoButton = section.locator(`button:has-text("${translation.contactInformationProvided}")`);
    await expect(contactInfoButton).toBeVisible();
  });

  test('Check visibility of "Average conversation time (min)" button in metric section', async ({ page }) => {
    const section = page.locator(`div:has-text("${translation.chooseAMetric}")`);
    const avgConversationTimeButton = section.locator(`button:has-text("${translation.averageConversationTimeMin}")`);
    await expect(avgConversationTimeButton).toBeVisible();
  });

  test('Check visibility of "Average waiting time (min)" button in metric section', async ({ page }) => {
    const section = page.locator(`div:has-text("${translation.chooseAMetric}")`);
    const avgWaitingTimeButton = section.locator(`button:has-text("${translation.averageNumberOfMessagesInAChat}")`);
    await expect(avgWaitingTimeButton).toBeVisible();
  });

  test('Check visibility of "Average number of messages in a chat" button in metric section', async ({ page }) => {
    const section = page.locator(`div:has-text("${translation.chooseAMetric}")`);
    const avgMessagesButton = section.locator(`button:has-text("${translation.countOfIdleChatsEndedByBürokratt}")`);
    await expect(avgMessagesButton).toBeVisible();
  });

  test('Check visibility of "Average waiting time " button in metric section', async ({ page }) => {
    const section = page.locator(`div:has-text("${translation.chooseAMetric}")`);
    const avgMessagesButton = section.locator(`button:has-text("${translation.averageWaitingTimeMin}")`);
    await expect(avgMessagesButton).toBeVisible();
  });

  test('Check visibility of "Additional Options" section button in additional options section', async ({ page }) => {
    const section = page.locator(`.card__body .additional-option-label:has-text("${translation.additionalOptions}")`);
    await expect(section).toBeVisible();
  });

  test('Check visibility of "Only Bürokratt involved" checkbox', async ({ page }) => {
    // Locate the checkbox using its label text
    const section = page.locator(`div:has-text("${translation.additionalOptions}")`);

    const onlyBürokrattInvolved = await section.locator('label').filter({ hasText: `${translation.onlyBürokrattInvolved}` });
    await expect(onlyBürokrattInvolved).toBeVisible();
  });

  test('Check visibility of CSA involved involved checkbox in additional options section', async ({ page }) => {
    const section = page.locator(`div:has-text("${translation.additionalOptions}")`);

    const onlyBürokrattInvolved = await section.locator('label').filter({ hasText: `${translation.CSAInvolved}` });
    await expect(onlyBürokrattInvolved).toBeVisible();
  });

  test('Check visibility of Total checkbox in additional options section', async ({ page }) => {
    const section = page.locator(`div:has-text("${translation.additionalOptions}")`);

    const onlyBürokrattInvolved = await section.locator('label').filter({ hasText: `${translation.total}` });
    await expect(onlyBürokrattInvolved).toBeVisible();
  });

  test('Check visibility of card header in additional options section', async ({ page }) => {
    const section = page.locator(`.card .title:has-text("${translation.totalNumberOfChats}")`);
    await expect(section).toBeVisible();
  });

  test('Check visibility of card other content in additional options section', async ({ page }) => {
    const section = page.locator(`.card:has-text("${translation.totalNumberOfChats}")`);

    const otherContent = await section.locator('.other_content');

    await expect(otherContent).toBeVisible();

    const downloadButton = await otherContent.locator('button:has-text("CSV")');
    await expect(downloadButton).toBeVisible();

    const dropDownMenu = await otherContent.locator('.select__wrapper')
    await expect(dropDownMenu).toBeVisible();

    dropDownMenu.click();

    const barChart = await dropDownMenu.locator(`.select__option:has-text("${translation.barChart}")`);
    const lineChart = await dropDownMenu.locator(`.select__option:has-text("${translation.lineChart}")`);
    const pieChart = await dropDownMenu.locator(`.select__option:has-text("${translation.pieChart}")`);

    await expect(barChart).toBeVisible();
    await expect(lineChart).toBeVisible();
    await expect(pieChart).toBeVisible();

  });
});