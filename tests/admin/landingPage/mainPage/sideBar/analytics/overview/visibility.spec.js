const { test, expect } = require('@playwright/test');
const { getTranslations } = require('../../../../../../translations/languageDetector');

test.describe('Metrics Cards Visibility Test', () => {
  let translation;
  let checkboxStates = {};
  let checkboxStatesInitialized = false;

  test.beforeEach(async ({ page }) => {
    await page.goto('https://admin.prod.buerokratt.ee/analytics/overview');
    translation = await getTranslations(page);
    await page.getByRole('button', { name: `${translation["edit"]}` }).click();

    if (!checkboxStatesInitialized) {
      const drawerBody = page.locator('.drawer__body');
      const sections = drawerBody.locator('.section');
      const sectionCount = await sections.count();

      for (let i = 0; i < sectionCount; i++) {
        const section = sections.nth(i);
        const label = await section.locator('label').innerText();
        const checkbox = section.locator('input[type="checkbox"]');
        const isChecked = await checkbox.isChecked();
        checkboxStates[label.trim()] = isChecked ? 'checked' : 'unchecked';
      }

      checkboxStatesInitialized = true;
    }
  });

  async function checkCardVisibility(cardSelector, translatedLabel, page) {
    const card = page.locator(cardSelector);
    if (checkboxStates[translatedLabel] === 'checked') {
      await expect(card).toBeVisible();
    } else {
      await expect(card).not.toBeVisible();
    }
  }

  test('Check h1 header visibility', async ({ page }) => {
    await expect(page.locator('h1')).toBeVisible();
  });

  test('Check "Change" button visibility', async ({ page }) => {
    await expect(page.locator(`button:has-text("${translation["edit"]}")`)).toBeVisible();
  });

  test('Check graph header visibility', async ({ page }) => {
    const card = page.locator('.card')
    const graphHeader = card.locator('.card__header').first();
    await expect(graphHeader).toBeVisible();
    await expect(graphHeader).toHaveText(translation.totalNumberOfChats);
  })

  test('Check graph and legend visibility', async ({ page }) => {
    const card = page.locator('.card');
    const cardBody = card.locator('.card__body');
    const graph = cardBody.locator('.recharts-wrapper');

    // Check if the graph is visible
    await expect(graph).toBeVisible();

    // Check if the legend is visible
    const legendWrapper = graph.locator('.recharts-legend-wrapper');
    await expect(legendWrapper).toBeVisible();

    // Check for each legend item and its associated text
    const legendItems = legendWrapper.locator('.recharts-legend-item');

    // Get the count of legend items and verify
    const itemCount = await legendItems.count();
    expect(itemCount).toBe(7); // Expect 7 legend items

    // Check the content of each legend item
    for (let i = 0; i < itemCount; i++) {
      const legendItem = legendItems.nth(i);
      const legendText = await legendItem.locator('span').textContent();

      // Verify the legend text matches expected values (you can modify these according to your needs)
      const expectedLegendTexts = [
        translation.chatsStarted,
        translation.clienfLeftWithAnAnswer,
        translation.customerLeftWithoutAnAnswer,
        translation.hateSpeech,
        translation.acceptedAnswer,
        translation.otherReasons,
        translation.answeredInAnotherChannel,
      ];
      expect(legendText.trim()).toBe(expectedLegendTexts[i]);
    }
  });

  test('Check opensearch Dashboard header visibility', async ({ page }) => {
    const card = page.locator('.card')
    const graphHeader = card.locator('.card__header').nth(1);
    await expect(graphHeader).toBeVisible();
  })

  test('Capture Open OpenSearch button', async ({ page }) => {
    const card = page.locator('.card');
    const cardBody = card.locator('.card__body');
    
    // Locate the button by class and text content
    const openSearchButton = cardBody.locator('button', { hasText: translation.openOpenSearch });
    
    // Check if the button is visible
    await expect(openSearchButton).toBeVisible();
    
    // Optionally, click the button to verify functionality
    await openSearchButton.click();
});

  const cardTests = [
    { key: "numberOfChatsToday", description: "Number of chats: today / previous" },
    { key: "forwardedChatsYesterday", description: "Forwarded chats yesterday: internal / external" },
    { key: "averageWaitingTimeToday", description: "Average waiting time: today / yesterday" },
    { key: "averageWaitingTimeWeek", description: "Average waiting time: week / previous" },
    { key: "averageChatsPerDayMonth", description: "Average chats per day: month / previous" },
    { key: "averageChatsPerDayWeek", description: "Average chats per day: week / previous" },
    { key: "numberOfChatsPerMonth", description: "Number of chats: month / previous" },
    { key: "averageNumberOfChatsAnsweredByBürokrattWeek", description: "Average chats answered by Bürokratt: week / previous" },
    { key: "averageNumberOfChatsAnsweredByBürokrattMonth", description: "Average chats answered by Bürokratt: month / previous" },
    { key: "answeredByBürokrattToday", description: "Answered by Bürokratt: today / yesterday" },
  ];

  for (const { key, description } of cardTests) {
    test(`Check card for "${description}" visibility`, async ({ page }) => {
      await checkCardVisibility(
        `.draggable-card:has(.title:text("${translation[key]}"))`,
        translation[key],
        page
      );
    });
  }
});
