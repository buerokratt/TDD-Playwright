import { test, expect } from '@playwright/test';

const adminPage = 'https://admin.prod.buerokratt.ee/'

test.beforeEach(async ({ page }) => {
    await page.goto(adminPage);
})

test.describe("background visibility", () => {
    const bacground = 'Bürokrati logo.cls-1{fill:#fff;}PROD BYKsisene TARA kaudu'

    test("should display the background", async ({ page }) => {
        await expect(page.getByText(bacground)).toBeVisible();
    })
})

test.describe("logos visibility", () => {
    test("should display buerokratt logo", async ({ page }) => {
        await expect(page.getByRole('img', { name: 'Bürokrati logo' })).toBeVisible();
    })

    test("should display the header logo", async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'PROD BYK' })).toBeVisible();
    })
})

test.describe("button visibility", () => {
    test("should display the authentication button", async ({ page }) => {
        await expect(page.getByRole('button', { name: 'sisene TARA kaudu' })).toBeVisible()
    })

    test("should contain correct text", async ({ page }) => {
        await expect(page.getByRole('button', { name: 'sisene TARA kaudu' })).toHaveText(/sisene TARA kaudu/)
    })
})

test.describe('sponsors image visibility', () => {
    test('should display the ESIF image', async ({ page }) => {
        await expect(page.getByRole('img', { name: 'Euroopa Liidu Struktuuri- ja' })).toBeVisible();
    });

    test('should display the NGEU image', async ({ page }) => {
        await expect(page.getByRole('img', { name: 'Euroopa Liidu taaste- ja' })).toBeVisible();
    });
});
