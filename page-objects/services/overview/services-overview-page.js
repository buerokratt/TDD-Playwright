const { expect } = require('@playwright/test');

class ServicesOverviewPage {
    constructor(page) {
        this.page = page;

        // headings
        this.headingServices = this.page.getByRole('heading', { name: 'Teenused', exact: true });
        this.headingGeneralServices = this.page.getByRole('heading', { name: 'Üldteenused', exact: true });

        // top actions (Teenused section)
        this.buttonImportMany = this.page.getByRole('button', { name: 'Impordi mitu', exact: true });
        this.buttonExportMany = this.page.getByRole('button', { name: 'Ekspordi mitu', exact: true });
        this.buttonCreateNewService = this.page.getByRole('button', { name: 'Loo uus teenus', exact: true });

        // optional confirm delete dialog
        this.buttonConfirmDelete = this.page.getByRole('dialog').getByRole('button', { name: 'Kustuta' });

        // tables
        this.tableServices = this.page.locator('table.data-table').nth(0); // Teenused
        this.tableGeneralServices = this.page.locator('table.data-table').nth(1); // Üldteenused

        // headers (same in both tables)
        this.thName = this.page.getByRole('columnheader', { name: 'Nimetus' });
        this.thDescription = this.page.getByRole('columnheader', { name: 'Kirjeldus' });
        this.thStatus = this.page.getByRole('columnheader', { name: 'Olek' });

        // pagination (label + select) — two instances, match by nth
        this.selectPageSizeServices = this.page.locator('label:has-text("Kuvan korraga") + select').nth(0);
        this.selectPageSizeGeneralServices = this.page.locator('label:has-text("Kuvan korraga") + select').nth(1);
    }

    // ---------- table helpers ----------
    getServiceRow(serviceTitle, table = this.tableServices) {
        // service name is rendered inside a <label> in the first cell
        return table.locator('tbody tr').filter({
            has: this.page.locator(`td >> label:has-text("${serviceTitle}")`),
        });
    }

    getFirstTableRow(table) {
        return table.locator('tbody').locator('tr').first();
    }

    getRowColumns(row) {
        return row.locator('td');
    }

    // ---------- actions / assertions ----------
    async assertServiceRowVisible(serviceTitle) {
        await this.getServiceRow(serviceTitle).waitFor({ state: 'visible' });
    }

    async assertRowDeleted(serviceTitle) {
        await this.getServiceRow(serviceTitle).waitFor({ state: 'detached' });
    }

    async clickCreateNew() {
        await this.buttonCreateNewService.click();
        await this.page.waitForLoadState('domcontentloaded');
    }

    async clickEdit(serviceTitle) {
        const row = this.getServiceRow(serviceTitle);
        await expect(row.getByRole('button', { name: 'Muuda' })).toBeVisible();
        await row.getByRole('button', { name: 'Muuda' }).click();
        await this.page.waitForLoadState('domcontentloaded');
    }

    async clickExport(serviceTitle) {
        const row = this.getServiceRow(serviceTitle);
        await expect(row.getByRole('button', { name: 'Ekspordi' })).toBeVisible();
        await row.getByRole('button', { name: 'Ekspordi' }).click();
    }

    async deleteService(serviceTitle) {
        const row = this.getServiceRow(serviceTitle);
        await expect(row.getByRole('button', { name: 'Kustuta' })).toBeVisible();
        await row.getByRole('button', { name: 'Kustuta' }).click();

        // confirm dialog if your UI shows one
        if (await this.page.getByRole('dialog').isVisible().catch(() => false)) {
            await this.buttonConfirmDelete.click();
        }
    }

    async assertServiceNameExists() {
        // first col contains a <label> with text
        await expect(
            this.getFirstTableRow(this.tableServices).locator('td').first().locator('label')
        ).toHaveText(/\w/);
    }

    async assertDescriptionFieldExists() {
        // description is column 2; can be empty label, but should exist
        await expect(
            this.getRowColumns(this.getFirstTableRow(this.tableServices)).nth(1).locator('label')
        ).toBeVisible();
    }

    async assertStatusExists() {
        const statuses = ['Mustand', 'Valmis', 'Aktiivne'];
        await expect(
            this.getRowColumns(this.getFirstTableRow(this.tableServices)).nth(2)
        ).toContainText(new RegExp(statuses.join('|')));
    }

    async assertStatusReady(title){
        await expect(
            this.getRowColumns(title).nth(2)
        ).toContainText('Valmis');
    }

    async assertEditButtonExists() {
        // actions start at col index 3: Muuda, Ekspordi, Kustuta
        await expect(
            this.getRowColumns(this.getFirstTableRow(this.tableServices))
                .nth(3)
                .getByRole('button', { name: 'Muuda' })
        ).toBeVisible();
    }

    async assertExportButtonExists() {
        await expect(
            this.getRowColumns(this.getFirstTableRow(this.tableServices))
                .nth(4)
                .getByRole('button', { name: 'Ekspordi' })
        ).toBeVisible();
    }

    async assertDeleteButtonExists() {
        await expect(
            this.getRowColumns(this.getFirstTableRow(this.tableServices))
                .nth(5)
                .getByRole('button', { name: 'Kustuta' })
        ).toBeVisible();
    }

    async assertPageSizeVisibleServices() {
        await expect(this.selectPageSizeServices).toBeVisible();
    }

    async assertPageSizeVisibleGeneralServices() {
        await expect(this.selectPageSizeGeneralServices).toBeVisible();
    }
}

module.exports = { ServicesOverviewPage };
