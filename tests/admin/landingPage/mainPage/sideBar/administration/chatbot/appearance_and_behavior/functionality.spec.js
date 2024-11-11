// test/appearance.spec.js
import { test, expect } from '@playwright/test';
import { getTranslations } from '@translation/languageDetector.js';

let translation;

test.describe('Buerokratt-Chatbot Appearance and Behaviour', () => {
  test.beforeEach(async ({ page }) => {
    test.info().annotations.push({ type: 'repository', description: 'Buerokratt-Chatbot' });
    await page.goto('https://admin.prod.buerokratt.ee/chat/chatbot/appearance');
    translation = await getTranslations(page);
    await page.waitForTimeout(3000);
  });

  test('Verify heading visibility', async ({ page }) => {
    const heading = await page.getByRole('heading', { name: `${translation.appearanceAndBehaviour}`, exact: true });
    await expect(heading).toBeVisible();
  });

  test.describe('Card body - Input and switch functionality', () => {
    test('Verify input: "Widget proactive seconds"', async ({ page }) => {
      const inputWidgetProactiveSeconds = await page.getByLabel(`${translation.widgetProactiveSeconds}`, { exact: true });
      await expect(inputWidgetProactiveSeconds).toBeVisible();
      
      const initialValue = await inputWidgetProactiveSeconds.inputValue();
      await inputWidgetProactiveSeconds.fill('10');
      await expect(inputWidgetProactiveSeconds).toHaveValue('10');
      await inputWidgetProactiveSeconds.fill(initialValue);
    });

    test('Verify switch: "Widget bubble message text"', async ({ page }) => {
        const switchWidgetBubbleMessageText = await page.getByLabel(`${translation.widgetBubbleMessageText}`, { exact: true }).first();
        await expect(switchWidgetBubbleMessageText).toBeVisible();
      
        // Check initial state using the aria-checked attribute
        const initialCheckedState = await switchWidgetBubbleMessageText.getAttribute('aria-checked');
        const isChecked = initialCheckedState === 'true';
      
        // Toggle the switch and check the state
        await switchWidgetBubbleMessageText.click();
        const newCheckedState = await switchWidgetBubbleMessageText.getAttribute('aria-checked');
        expect(newCheckedState).toBe(isChecked ? 'false' : 'true');
      
        // Toggle the switch back to the original state
        await switchWidgetBubbleMessageText.click();
        const revertedCheckedState = await switchWidgetBubbleMessageText.getAttribute('aria-checked');
        expect(revertedCheckedState).toBe(initialCheckedState);
      });
      

    test('Verify input: "Widget bubble message seconds"', async ({ page }) => {
      const inputWidgetBubbleMessageSeconds = await page.getByLabel(`${translation.widgetBubbleMessageSeconds}`, { exact: true });
      await expect(inputWidgetBubbleMessageSeconds).toBeVisible();

      const initialValue = await inputWidgetBubbleMessageSeconds.inputValue();
      await inputWidgetBubbleMessageSeconds.fill('5');
      await expect(inputWidgetBubbleMessageSeconds).toHaveValue('5');
      await inputWidgetBubbleMessageSeconds.fill(initialValue);
    });

    test('Verify input: "Widget bubble message text"', async ({ page }) => {
      const inputWidgetBubbleMessageText = await page.getByLabel(`${translation.widgetBubbleMessageText}`, { exact: true }).nth(1);
      await expect(inputWidgetBubbleMessageText).toBeVisible();

      const initialValue = await inputWidgetBubbleMessageText.inputValue();
      await inputWidgetBubbleMessageText.fill('Test message');
      await expect(inputWidgetBubbleMessageText).toHaveValue('Test message');
      await inputWidgetBubbleMessageText.fill(initialValue);
    });

    test('Verify input: "Widget color"', async ({ page }) => {
      const inputWidgetColor = await page.getByLabel(`${translation.widgetColor}`, { exact: true });
      await expect(inputWidgetColor).toBeVisible();

      await inputWidgetColor.click();
      await inputWidgetColor.evaluate(input => input.blur());
    });

    test('Verify select: "Widget animation"', async ({ page }) => {
        const selectWidgetAnimation = await page.getByRole('combobox', { name: `${translation.widgetAnimation}`, exact: true });
        await expect(selectWidgetAnimation).toBeVisible();
      
        // Open the dropdown
        await selectWidgetAnimation.click();
      
        // Select an option by clicking it in the list
        const option = await page.getByRole('option', { name: 'Wiggle', exact: true });
        await option.click();
      
        // Verify if the selection reflects in the dropdown (using text or another indicator)
        const selectedText = await selectWidgetAnimation.textContent();
        expect(selectedText).toContain('Wiggle');
      
        // Re-select a different option if necessary
        await selectWidgetAnimation.click();
        const anotherOption = await page.getByRole('option', { name: 'Jump', exact: true });
        await anotherOption.click();
        
        const updatedText = await selectWidgetAnimation.textContent();
        expect(updatedText).toContain('Jump');
      });
  });

  test.describe('Card footer - Button functionality', () => {
    test('Verify Save button functionality', async ({ page }) => {
      const saveButton = await page.getByText(`${translation.save}`, { exact: true });
      await expect(saveButton).toBeVisible();
    });

    test('Verify Preview button functionality', async ({ page }) => {
      const previewButton = await page.getByText(`${translation.preview}`, { exact: true });
      await expect(previewButton).toBeVisible();
    });
  });
});
