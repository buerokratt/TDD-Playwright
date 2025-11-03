class ServicesOverviewPage{
    constructor(page) {
        this.page = page;

        this.header = this.page.getByRole('button', {name: 'Teenused'});
        this.buttonCreateNewService = this.page.getByText('Loo uus teenus');
        this.buttonConfirmDelete = this.page.getByRole('dialog').getByRole('button', { name: 'Kustuta' });
    }

    getServiceRow(serviceTitle){
        return this.page.locator('tr').filter({
            has: this.page.locator(`td:has-text("${serviceTitle}")`)
        });
    }

    async assertServiceRowVisible(serviceTitle){
        await this.getServiceRow(serviceTitle).waitFor({ state: 'visible'});
    }

    async assertRowDeleted(serviceTitle){
        await this.getServiceRow(serviceTitle).waitFor({ state: 'detached'});
    }

    async clickEdit(serviceTitle){
        await this.getServiceRow(serviceTitle).getByRole('button', { name: 'Muuda' }).click();
    }

    async clickCreateNew(){
        await this.buttonCreateNewService.click();
    }

    async deleteService(serviceTitle){
        // TODO: delete the last service that was created
        await this.getServiceRow(serviceTitle).getByRole('button', {name: 'Kustuta'}).click();
        await this.buttonConfirmDelete.click();
    }
}
module.exports = { ServicesOverviewPage };