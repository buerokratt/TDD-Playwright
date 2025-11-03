class SideMenuPage {
    constructor(page) {
        this.page = page;
        this.buttonVestlused = this.page.getByRole('button', {name:'Vestlused'});
        this.buttonTreening = this.page.getByRole('button', {name:'Treening'});
        this.buttonAnalyytika = this.page.getByRole('button', {name:'Analüütika'});
        this.buttonTeenused = this.page.getByRole('button', {name:'Teenused'});
        this.buttonHaldus = this.page.getByRole('button', {name:'Haldus'});
        this.buttonCollapseAll = this.page.getByRole('button', {name: 'Kitsenda menüü'});
    }


    async isChatMenuVisible(){
        await this.buttonVestlused.isVisible();
    }

    async assertVestlusedButtonVisible(){
        await this.buttonVestlused.waitFor({ state: 'visible'});
    }

    async assertTreeningButtonVisible(){
        await this.buttonTreening.waitFor({ state: 'visible'});
    }

    async assertAnalyytikaButtonVisible(){
        await this.buttonAnalyytika.waitFor({ state: 'visible'});
    }

    async assertTeenusedButtonVisible(){
        await this.buttonTeenused.waitFor({ state: 'visible'});
    }

    async assertHaldusButtonVisible(){
        await this.buttonHaldus.waitFor({ state: 'visible'});
    }

    async assertCollapseButtonVisible(){
        await this.buttonCollapseAll.waitFor({ state: 'visible'});
    }
}

module.exports = { SideMenuPage };