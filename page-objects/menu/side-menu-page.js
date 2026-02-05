const {expect} = require("@playwright/test");

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
        await expect(this.buttonVestlused).toBeVisible();
    }

    async assertVestlusedButtonVisible(){
        await expect(this.buttonVestlused).toBeVisible();
    }

    async assertTreeningButtonVisible(){
        await expect(this.buttonTreening).toBeVisible();
    }

    async assertAnalyytikaButtonVisible(){
        await expect(this.buttonAnalyytika).toBeVisible();
    }

    async assertTeenusedButtonVisible(){
        await expect(this.buttonTeenused).toBeVisible();
    }

    async assertHaldusButtonVisible(){
        await expect(this.buttonHaldus).toBeVisible();
    }

    async assertCollapseButtonVisible(){
        await expect(this.buttonCollapseAll).toBeVisible();
    }
}

module.exports = { SideMenuPage };