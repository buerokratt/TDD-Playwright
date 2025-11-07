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
        await this.page.waitForLoadState('networkidle');
        await expect(this.getServiceRow(serviceTitle).getByRole('button', { name: 'Muuda' })).toBeVisible();
        await this.getServiceRow(serviceTitle).getByRole('button', { name: 'Muuda' }).click();
    }

    async clickCreateNew(){
        await this.buttonCreateNewService.click();
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
                ).nth(2)
            ).toContainText(/\w/);
        }
    }

    async assertStatusExists(){
        const statuses = ['Mustand', 'Valmis', 'Kinnitatud', 'Valmis'];
        await expect(
            this.getRowColumns(
                this.getFirstTableRow(this.tableServices)
            ).nth(3)
        ).toContainText(new RegExp(statuses.join('|')));
    }

    async assertEditButtonExists(){
        await expect(
            this.getRowColumns(
                this.getFirstTableRow(this.tableServices)
            ).nth(4).getByRole('button', { name: 'Muuda' })
        ).toBeVisible();
    }

    async assertDeleteButtonExists(){
        await expect(
            this.getRowColumns(
                this.getFirstTableRow(this.tableServices)
            ).nth(5).getByRole('button', { name: 'Kustuta' })
        ).toBeVisible();
    }

    async assertPageSizeVisible(){
        await expect(this.page.getByRole('combobox', { name: 'Kuvan korraga' })).toBeVisible();
    }
}
module.exports = { ServicesOverviewPage };