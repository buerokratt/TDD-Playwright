import { test, expect } from '@playwright/test';

test.describe('chatbox details menu', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('https://prod.buerokratt.ee/');
        await page.getByLabel('Ava vestlus').click();
        await page.getByLabel('Detailid').click();
    });

    test.describe('header elements visibility', () => {
        test('should display the chatbox title', async ({ page }) => {
            await expect(page.getByText('Bürokratt')).toBeVisible();
        });

        test('should display the details button', async ({ page }) => {
            await expect(page.getByLabel('Detailid')).toBeVisible();
        });

        test('should display the minimize button', async ({ page }) => {
            await expect(page.getByLabel('Minimeeri')).toBeVisible();
        });

        test('should display the close button', async ({ page }) => {
            await expect(page.getByLabel('Sulge')).toBeVisible();
        });
    });

    test.describe('terms of service and authentication button visibility', () => {
        test('should display the terms of service button', async ({ page }) => {
            await expect(page.getByRole('button', { name: 'Tutvuge teenuse tingimustega' })).toBeVisible();
        });

        // test('should NOT display the authentication button', async ({ page }) => {
        //     await expect(page.getByRole('button', { name: 'Isikustage TARA kaudu' })).toBeHidden();
        // });
    });

    test.describe('advice visibility', () => {
        test('should display the advice heading', async ({ page }) => {
            await expect(page.getByRole('heading', { name: 'Teksti suurus' })).toBeVisible();
        });

        test('should display the advice text', async ({ page }) => {
            await expect(page.getByText('Kõikides populaarsetes')).toBeVisible();
        });
    });

    test.describe('sponsors image visibility', () => {
        test('should display the ESIF image', async ({ page }) => {
            await expect(page.getByRole('img', { name: 'Euroopa Liidu Struktuuri- ja' })).toBeVisible();
        });

        test('should display the NGEU image', async ({ page }) => {
            await expect(page.getByRole('img', { name: 'Euroopa Liidu taaste- ja' })).toBeVisible();
        });
    });
});


// test.describe('authentication button visibility', () => {
    // test('authentication button visible', async ({ page }) => {
    //     ///navigate to chat 
    //     await page.goto('https://prod.buerokratt.ee/');
    //     await page.getByLabel('Ava vestlus').click();

    //     // make a query
    //     await page.getByPlaceholder('Kirjutage oma sõnum...').fill('Maksuvaba miinimum?');
    //     await page.getByLabel('Saada').click()

    //     //check if button is visible in details menu
    //     await page.getByRole('button', { name: 'Detailid' }).click()
    //     await expect(page.getByRole('button', { name: 'Isikustage TARA kaudu' })).toBeVisible();
    // })
// })

