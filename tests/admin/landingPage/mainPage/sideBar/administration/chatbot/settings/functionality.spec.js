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

  test('should display heading', async ({ page }) => {
    const heading = await page.getByRole('heading', { name: `${translation.settings}`, exact: true });
    await expect(heading).toBeVisible();
  });

  test.describe('Card Header - Chatbot Active Switch', () => {
    test('should display and toggle Chatbot Active switch', async ({ page }) => {
      const cardHeader = page.locator('.card__header').first();
      const switchLabel = await cardHeader.getByText(`${translation.chatbotActive}`, { exact: true });
      const switchButton = await cardHeader.getByLabel(`${translation.chatbotActive}`, { exact: true });

      await expect(switchLabel).toBeVisible();
      await expect(switchButton).toBeVisible();

      const initialState = await switchButton.isChecked();
      await switchButton.click();
      await expect(switchButton.isChecked()).not.toBe(initialState);

      // Revert to original state
      await switchButton.click();
    });
  });

  test.describe('Card Body - Show Support Name and Title Switches', () => {
    test('should display and toggle Show Support Name switch', async ({ page }) => {
      const cardBody = page.locator('.card__body').first();
      const nameSwitchLabel = await cardBody.getByText(`${translation.showSupportName}`, { exact: true });
      const nameSwitchButton = await cardBody.getByLabel(`${translation.showSupportName}`, { exact: true });

      await expect(nameSwitchLabel).toBeVisible();
      await expect(nameSwitchButton).toBeVisible();

      const initialNameState = await nameSwitchButton.isChecked();
      await nameSwitchButton.click();
      await expect(nameSwitchButton.isChecked()).not.toBe(initialNameState);

      // Revert to original state
      await nameSwitchButton.click();
    });

    test('should display and toggle Show Support Title switch', async ({ page }) => {
      const cardBody = page.locator('.card__body').first();
      const titleSwitchLabel = await cardBody.getByText(`${translation.showSupportTitle}`, { exact: true });
      const titleSwitchButton = await cardBody.getByLabel(`${translation.showSupportTitle}`, { exact: true });

      await expect(titleSwitchLabel).toBeVisible();
      await expect(titleSwitchButton).toBeVisible();

      const initialTitleState = await titleSwitchButton.isChecked();
      await titleSwitchButton.click();
      await expect(titleSwitchButton.isChecked()).not.toBe(initialTitleState);

      // Revert to original state
      await titleSwitchButton.click();
    });
  });

  test.describe('Card Footer - Save Button', () => {
    test('should save changes and verify persistence', async ({ page }) => {
      const cardBody = page.locator('.card__body').first();
      const nameSwitchButton = await cardBody.getByLabel(`${translation.showSupportName}`, { exact: true });
      const titleSwitchButton = await cardBody.getByLabel(`${translation.showSupportTitle}`, { exact: true });

      // Capture initial states
      const initialNameState = await nameSwitchButton.isChecked();
      const initialTitleState = await titleSwitchButton.isChecked();

      // Make changes
      await nameSwitchButton.click();
      await titleSwitchButton.click();

      // Save changes
      const saveButton = await page.getByText(`${translation.save}`, { exact: true });
      await saveButton.click();

      // Refresh page and verify changes are persisted
      await page.reload();
      await page.waitForTimeout(3000);
      const updatedNameState = await cardBody.getByLabel(`${translation.showSupportName}`, { exact: true }).isChecked();
      const updatedTitleState = await cardBody.getByLabel(`${translation.showSupportTitle}`, { exact: true }).isChecked();

      await expect(updatedNameState).not.toBe(initialNameState);
      await expect(updatedTitleState).not.toBe(initialTitleState);

      // Revert to original state and save
      if (updatedNameState !== initialNameState) await nameSwitchButton.click();
      if (updatedTitleState !== initialTitleState) await titleSwitchButton.click();
      await saveButton.click();
    });
  });
});
