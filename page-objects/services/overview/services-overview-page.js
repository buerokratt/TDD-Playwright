const {expect} = require("@playwright/test");

class ServicesOverviewPage{
    constructor(page) {
        this.page = page;

        this.headingServices = this.page.getByRole('heading', {name: 'Teenused', exact: true});
        this.headingGeneralServices = this.page.getByRole('heading', {name: 'Üldteenused', exact: true});
        this.buttonCreateNewService = this.page.getByText('Loo uus teenus');
        this.buttonConfirmDelete = this.page.getByRole('dialog').getByRole('button', { name: 'Kustuta' });

        // table headers
        this.thName = this.page.getByRole('columnheader', { name: 'Nimietus' });
        this.thLinkedIntent = this.page.getByRole('columnheader', { name: 'Ühendatud teema' });
        this.thStatus = this.page.getByRole('columnheader', { name: 'Olek' });

        this.tableServices = this.page.locator('table').first(); // Teenused tabel
        this.tableGeneralServices = this.page.locator('table').nth(1); // Üldteenused tabel
    }

    getServiceRow(serviceTitle){
        return this.tableServices.locator('tr').filter({
            has: this.page.locator(`td:has-text("${serviceTitle}")`)
        });
    }

    getFirstTableRow(table){
        return table.locator('tbody').locator('tr').first();
    }

    getRowColumns(row){
        return row.locator('td');
    }

    async assertServiceRowVisible(serviceTitle){
        await this.getServiceRow(serviceTitle).waitFor({ state: 'visible'});
    }

    async assertRowDeleted(serviceTitle){
        await this.getServiceRow(serviceTitle).waitFor({ state: 'detached'});
    }

    async clickEdit(serviceTitle){
        await expect(this.getServiceRow(serviceTitle).getByRole('button', { name: 'Muuda' })).toBeVisible();
        await this.getServiceRow(serviceTitle).getByRole('button', { name: 'Muuda' }).click();
        await this.page.waitForLoadState('domcontentloaded');
    }

    async clickCreateNew(){
        await this.buttonCreateNewService.click();
        await this.page.waitForLoadState('domcontentloaded');
    }

    async deleteService(serviceTitle){
        await this.getServiceRow(serviceTitle).getByRole('button', {name: 'Kustuta'}).click();
        await this.buttonConfirmDelete.click();
    }

    async assertServiceNameExists(){
        await expect(
            this.getRowColumns(
                this.getFirstTableRow(this.tableServices)
            ).first()
        ).toHaveText(/\w/);
    }

    async assertIntentFieldExists(){
        const buttonLinkIntent = this.getRowColumns(this.getServiceRow(this.tableServices)).getByText('Ühendage teemaga');
        if (await buttonLinkIntent.isVisible()) {
            await buttonLinkIntent.waitFor({ state: 'visible' });
        } else {
            await expect(
                this.getRowColumns(
                    this.getFirstTableRow(this.tableServices)
                ).nth(1)
            ).toContainText(/\w/);
        }
    }

    async assertStatusExists(){
        const statuses = ['Mustand', 'Valmis', 'Aktiivne'];
        await expect(
            this.getRowColumns(
                this.getFirstTableRow(this.tableServices)
            ).nth(2)
        ).toContainText(new RegExp(statuses.join('|')));
    }

    async assertStatusReady(serviceName){
        await expect(this.getRowColumns(
            this.getServiceRow(serviceName).nth(2)
        )).toContain('Valmis');
    }

    async assertEditButtonExists(){
        await expect(
            this.getRowColumns(
                this.getFirstTableRow(this.tableServices)
            ).nth(3).getByRole('button', { name: 'Muuda' })
        ).toBeVisible();
    }

    async assertDeleteButtonExists(){
        await expect(
            this.getRowColumns(
                this.getFirstTableRow(this.tableServices)
            ).nth(5).getByRole('button', { name: 'Kustuta' })
        ).toBeVisible();
    }

    async assertPageSizeVisibleServices(){
        await expect(this.page.locator('label:has-text("Kuvan korraga") + select').nth(0)).toBeVisible();
    }

    async assertPageSizeVisibleGeneralServices(){
        await expect(this.page.locator('label:has-text("Kuvan korraga") + select').nth(1)).toBeVisible();
    }
}
module.exports = { ServicesOverviewPage };