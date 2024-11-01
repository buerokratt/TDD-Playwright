import {Page, Locator} from '@playwright/test';

export class UnansweredConversationsPage {
    readonly page: Page;
    readonly title: Locator;
    
    constructor(page: Page) {
        this.page = page;
        this.title = page.locator('.vertical-tabs__group-header p');
    }


}