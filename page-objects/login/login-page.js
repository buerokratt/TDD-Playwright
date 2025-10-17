class LoginPage {
    constructor(page) {
        this.page = page;
    }

    async navigateTo(url) {
        await this.page.goto(url);
    }

    async getTitle() {
        return await this.page.title();
    }

    async click(selector) {
        await this.page.click(selector);
    }

    async type(selector, text) {
        await this.page.fill(selector, text);
    }

    async waitForSelector(selector) {
        await this.page.waitForSelector(selector);
    }
}

module.exports = LoginPage;