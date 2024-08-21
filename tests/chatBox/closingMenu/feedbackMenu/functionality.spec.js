import { test, expect } from '@playwright/test';

test.beforeEach('prepair page for each test', async ({ page }) => {
    await page.goto('https://prod.buerokratt.ee/');
    await page.getByLabel('Ava vestlus').click();
    await page.getByPlaceholder('Kirjutage oma sõnum...').click();
    await page.getByPlaceholder('Kirjutage oma sõnum...').fill('Maksuvaba miinimum?');
    await page.getByLabel('Saada').click();

    // wait for answer - otherwise all the tests will fail
    await page.waitForTimeout(10000)

    await page.getByLabel('Sulge').click();
    await page.getByRole('button', { name: 'Jah, sain vastuse' }).click();
})

test.describe('rating and feedback input', async () => {
    test('should have rating buttons enabled/ clickable', async ({ page }) => {
        for (let i = 0; i <= 10; i++) {
            const numButton = page.getByRole('button', { name: `${i}`, exact: true });
            await expect(numButton).toBeEnabled();
            await expect(numButton).toHaveCSS('background-color', 'rgb(240, 241, 242)');
            await numButton.click();
            await expect(numButton).toHaveCSS('background-color', 'rgb(0, 60, 255)');
            }
        }); 

    test('should have input area enabled and fillable', async ({page}) => {
        const inputArea = await page.getByPlaceholder('Sisestage oma tagasiside...')
        await expect(inputArea).toBeEnabled()
        await inputArea.fill('M/Test')
        await expect(inputArea).toHaveValue("M/Test")
    })
})


test.describe('confirm button functionality', async () => {
    test('should confirm with input - confirm button', async ({page}) => {
        await page.getByRole('button', { name: "10", exact: true }).click()

        await page.getByPlaceholder('Sisestage oma tagasiside...').fill('M/Test')
        await page.getByRole('button', { name: 'Kinnita' }).click()

        await expect(page.getByRole('dialog')).toBeHidden()
    })

    test('should confirm without input - confirm button', async ({page}) => {
        await page.getByRole('button', { name: 'Kinnita' }).click()
        await expect(page.getByRole('dialog')).toBeHidden()
    })
})

test.describe('skip button functionality', async () => {
    test('should skip with input', async ({page}) => {
        await page.getByRole('button', { name: "10", exact: true }).click()

        await page.getByPlaceholder('Sisestage oma tagasiside...').fill('M/Test')
        await page.getByRole('button', { name: 'Jäta vahele' }).click()

        await expect(page.getByRole('dialog')).toBeHidden()
    })

    test('should skip without input', async ({page}) => {
        await page.getByRole('button', { name: 'Jäta vahele' }).click()
        await expect(page.getByRole('dialog')).toBeHidden()
    })
})



test('should have download dialog button enabled', async ({page}) => {
    const downloadDialog = await page.getByRole('button', { name: 'Lae vestlus alla' })
    await expect(downloadDialog).toBeEnabled()
})

test('should download dialog', async ({page}) => {
    const downloadDialog = await page.getByRole('button', { name: 'Lae vestlus alla' })
    let downloadTriggered = false;
    page.on('request', (request) => {
        if (request.url().includes('download')) { // Adjust based on expected file format
            downloadTriggered = true;
        }
    });

    await downloadDialog.click();

    await expect(downloadTriggered).toBe(true);
})