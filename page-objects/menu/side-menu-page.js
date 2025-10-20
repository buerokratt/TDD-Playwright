class SideMenuPage {
    constructor(page) {
        this.page = page;
        this.vestlused = this.page.getByText('Vestlused');
        this.treening = this.page.getByText('Treening');
        this.analyytika = this.page.getByText('Analüütika');
        this.teenused = this.page.getByText('Teenused');
        this.haldus = this.page.getByText('Haldus');
    }


    async isChatMenuVisible(){
        await this.vestlused.isVisible();
    }
}

module.exports = { SideMenuPage };