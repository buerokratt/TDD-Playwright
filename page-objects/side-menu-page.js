class SideMenuPage {
    constructor(page) {
        this.page = page;
    }
    vestlused = this.page.getByText('Vestlused');
    treening = this.page.getByText('Treening');
    analyytika = this.page.getByText('Analüütika');
    teenused = this.page.getByText('Teenused');
    haldus = this.page.getByText('Haldus');

    async isChatMenuVisible(){
        await this.vestlused.isVisible();
    }
}

module.exports = SideMenuPage;