"I am working on converting a businessDSL into Playwright tests. Provide the test file without any additional information. I will provide you with the businessDSL. Here are the key requirements and you should consider only those rules that are in current DSL needed. It means that if DSL does not have element that is here in the rules, then you should not consider this specific rule. In other cases should consider them:
1. Parse the DSL:
      nth-instance: Indicates the exact matching instance of a repeated element. If present, apply .nth() in the Playwright locator with the provided index.
2. Text-based locators: 
  All locators for text-based elements (labels, buttons, headers) must use translation keys. Translations are fetched using the getTranslations function and should be integrated into the locators as `${translation.key}`. key's first letter is lowercase. 
  
  Use page.getByText() for labels, buttons, or any other text-based elements.
  Use page.getByLabel() for elements that are associated with a label.
  Use page.getByRole() for headings.
  Examples: 
         const switchButton = await page.getByLabel(`${translation.widgetBubbleMessageText}`, { exact: true });
         const switchLabel = await page.getByText(`${translation.showSupportName}`, { exact: true });
         const saveButton = await page.getByText(`${translation.save}`, {exact: true });
         const heading = await page.getByRole('heading', { name: `${translation.settings}`, exact: true });

  Using getByText() and there's extra argument in the .yml file nth-matching-element the value is a locator to the n-th matching element. This is important. 
  Example:
        const label = await page.getByText(`${translation.widgetBubbleMessageText}`).nth(0);
        const label = await page.getByText(`${translation.widgetBubbleMessageText}`).nth(1);
  Otherwise:
  Example: 
    const label = await page.getByText(`${translation.widgetProactiveSeconds}`, { exact: true });
    const input = await page.getByLabel(`${translation.widgetProactiveSeconds}`, { exact: true });
    await expect(label).toBeVisible();
    await expect(input).toBeVisible();

3. Dropdown handling: 
   Use the following format for dropdown (select) elements:
   const select = await page.getByRole('combobox', { name: `${translation.widgetAnimation}` });

4. Table handling: 
   Consider only first row when checking data persistence. For example when checking edit and delete buttons in table data.
   For example: const editButton = container.getByRole('button', { name: `${translation.edit}` }).first();
                const deleteButton = container.getByRole('button', { name: `${translation.delete}` }).first();

5. Test setup:
Include navigation and fetching translations in a beforeEach hook to ensure the page and translations are ready before running each test.
Base URL: https://admin.prod.buerokratt.ee. Add this before the url provided in the DSL under resource header.
Translations should be defined as:
  import { getTranslations } from '@translation/languageDetector.js';
  let translation;

And in beforeEach:
a. Each test should have annotation. So lets add in beforeEach: test.info().annotations.push({ type: 'repository', description: '<description>' });
   where instead of <description> should take value from BusinessDSL description: value. 

b. translation = await getTranslations(page);
   Translation should be after the playwright test has gone to the page to avoid security error.

c. Include a 3000ms timeout in the beforeEach to ensure all elements load properly.


6. Logical grouping:
Group tests using test.describe() by logical parts (e.g., headings, card body, footer).
Combine related assertions (e.g., heading and button checks) into single tests where possible.
The output should be a valid Playwright test file, ready for copy-pasting and running without further modification."

7. Exact match for similar elements:
Add { exact: true } to all locators.