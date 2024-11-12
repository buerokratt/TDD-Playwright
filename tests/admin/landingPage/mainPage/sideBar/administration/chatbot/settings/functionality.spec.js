import { test, expect } from '@playwright/test';
import { getTranslations } from '@translation/languageDetector.js';

let translation;

test.describe('Buerokratt-Chatbot', () => {

  test.beforeEach(async ({ page }) => {
    test.info().annotations.push({ type: 'repository', description: 'Buerokratt-Chatbot' });
    await page.goto('https://admin.prod.buerokratt.ee/chat/chatbot/settings');
    translation = await getTranslations(page);
    await page.waitForTimeout(3000);
  });

  test('Verify heading visibility', async ({ page }) => {
    const heading = await page.getByRole('heading', { name: `${translation.settings}`, exact: true });
    await expect(heading).toBeVisible();
  });

  test('Verify and toggle Chatbot active switch functionality', async ({ page }) => {
    const switchLabel = await page.getByText(`${translation.chatbotActive}`, { exact: true });
    const switchButton = await page.getByLabel(`${translation.chatbotActive}`, { exact: true });
    await expect(switchLabel).toBeVisible();
    await expect(switchButton).toBeVisible();

    // Capture initial state
    const initialState = await switchButton.isChecked();

    // Toggle switch
    await switchButton.click();
    await expect(switchButton).not.toHaveAttribute('checked', `${initialState}`);

    // Save and verify persistence after page reload
    const saveButton = await page.getByText(`${translation.save}`, { exact: true });
    await saveButton.click();
    await page.reload();
    await page.waitForTimeout(3000);

    const newState = await page.getByLabel(`${translation.chatbotActive}`, { exact: true }).isChecked();
    expect(newState).toBe(!initialState);

    // Reset to original state
    await switchButton.click();
    await saveButton.click();
  });

  test('Verify and toggle Show support name switch functionality', async ({ page }) => {
    const switchLabel = await page.getByText(`${translation.showSupportName}`, { exact: true });
    const switchButton = await page.getByLabel(`${translation.showSupportName}`, { exact: true });
    await expect(switchLabel).toBeVisible();
    await expect(switchButton).toBeVisible();

    // Capture initial state
    const initialState = await switchButton.isChecked();

    // Toggle switch
    await switchButton.click();
    await expect(switchButton).not.toHaveAttribute('checked', `${initialState}`);

    // Save and verify persistence after page reload
    const saveButton = await page.getByText(`${translation.save}`, { exact: true });
    await saveButton.click();
    await page.reload();
    await page.waitForTimeout(3000);

    const newState = await page.getByLabel(`${translation.showSupportName}`, { exact: true }).isChecked();
    expect(newState).toBe(!initialState);

    // Reset to original state
    await switchButton.click();
    await saveButton.click();
  });

  test('Verify and toggle Show support title switch functionality', async ({ page }) => {
    const switchLabel = await page.getByText(`${translation.showSupportTitle}`, { exact: true });
    const switchButton = await page.getByLabel(`${translation.showSupportTitle}`, { exact: true });
    await expect(switchLabel).toBeVisible();
    await expect(switchButton).toBeVisible();

    // Capture initial state
    const initialState = await switchButton.isChecked();

    // Toggle switch
    await switchButton.click();
    await expect(switchButton).not.toHaveAttribute('checked', `${initialState}`);

    // Save and verify persistence after page reload
    const saveButton = await page.getByText(`${translation.save}`, { exact: true });
    await saveButton.click();
    await page.reload();
    await page.waitForTimeout(3000);

    const newState = await page.getByLabel(`${translation.showSupportTitle}`, { exact: true }).isChecked();
    expect(newState).toBe(!initialState);

    // Reset to original state
    await switchButton.click();
    await saveButton.click();
  });
});
