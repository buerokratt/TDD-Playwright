// /tests/analytics-overview.spec.js

import { test, expect } from '@playwright/test';
import { getTranslations } from '@translation/languageDetector.js';

let translation;

test.describe('Analytics Module Overview', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('https://admin.prod.buerokratt.ee/analytics/overview');
        translation = await getTranslations(page);
        test.info().annotations.push({ type: 'repository', description: 'Analytics-Module' });
        await page.waitForTimeout(3000);
    });

    test('Validate Overview heading and Edit button', async ({ page }) => {
        const heading = await page.getByRole('heading', { name: `${translation.overview}`, exact: true });
        const editButton = await page.getByRole('button', { name: `${translation.edit}`, exact: true });

        await expect(heading).toBeVisible();
        await expect(editButton).toBeVisible();
    });

    test('Validate draggable card metrics', async ({ page }) => {
        const cardHeading1 = await page
            .locator('.draggable-card')
            .nth(0)
            .getByText(`${translation.averageChatsPerDayMonthPrevious}`, { exact: true });
        const cardHeading2 = await page
            .locator('.draggable-card')
            .nth(1)
            .getByText(`${translation.averageChatsPerDayWeekPrevious}`, { exact: true });
        const cardHeading3 = await page
            .locator('.draggable-card')
            .nth(2)
            .getByText(`${translation.averageChatsAnsweredByBurokratMonthPrevious}`, { exact: true });
        const cardHeading4 = await page
            .locator('.draggable-card')
            .nth(3)
            .getByText(`${translation.averageChatsAnsweredByBurokratWeekPrevious}`, { exact: true });
        const cardHeading5 = await page
            .locator('.draggable-card')
            .nth(4)
            .getByText(`${translation.answeredByBurokratTodayYesterday}`, { exact: true });
        const cardHeading6 = await page
            .locator('.draggable-card')
            .nth(5)
            .getByText(`${translation.numberOfChatsMonthPrevious}`, { exact: true });

        await expect(cardHeading1).toBeVisible();
        await expect(cardHeading2).toBeVisible();
        await expect(cardHeading3).toBeVisible();
        await expect(cardHeading4).toBeVisible();
        await expect(cardHeading5).toBeVisible();
        await expect(cardHeading6).toBeVisible();
    });

    test('Validate OpenSearch Dashboard card', async ({ page }) => {
        const dashboardHeading = await page.getByRole('heading', { name: `${translation.openSearchDashboardOSD}`, exact: true });
        const openSearchButton = await page
            .locator('.card__body')
            .getByRole('button', { name: `${translation.openOpenSearch}`, exact: true });

        await expect(dashboardHeading).toBeVisible();
        await expect(openSearchButton).toBeVisible();
    });

    test('Validate Total Number of Chats card with chart', async ({ page }) => {
        const cardLabel = await page.getByRole('heading', { name: `${translation.totalNumberOfChats}`, exact: true });
        const chart = await page.locator('.recharts-wrapper');

        await expect(cardLabel).toBeVisible();
        await expect(chart).toBeVisible();
    });
});
