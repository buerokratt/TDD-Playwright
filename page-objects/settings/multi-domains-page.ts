import { Locator, Page, expect } from '@playwright/test';

import { ACTION_TIMEOUT } from '@utils/constants';
import { URLS } from '@utils/env';
import { RouteReadyOptions } from '@utils/interfaces';
import { waitForMultiDomainsReady } from '@utils/waits';

export class MultiDomainsPage {
  private readonly page: Page;

  private readonly inputsDomainName: Locator;
  private readonly inputsDomainUrl: Locator;

  private readonly buttonsDeleteDomain: Locator;
  private readonly buttonAddNew: Locator;
  private readonly buttonSave: Locator;

  private readonly headingMultidomains: Locator;
  private readonly toastList: Locator;

  constructor(page: Page) {
    this.page = page;

    this.headingMultidomains = this.page.getByRole('heading', { name: 'Multidomains', exact: true });

    this.inputsDomainName = this.page.locator('main input[name^="widgetDomains."][name$=".name"]');
    this.inputsDomainUrl = this.page.locator('main input[name^="widgetDomains."][name$=".url"]');

    this.buttonsDeleteDomain = this.page.locator('main button.btn--error');
    this.buttonAddNew = this.page.getByRole('button', { name: 'Add new', exact: true });
    this.buttonSave = this.page.getByRole('button', { name: 'Save', exact: true });

    this.toastList = this.page.locator('ol.toast__list');
  }

  async waitForReady(options: RouteReadyOptions = {}): Promise<void> {
    await waitForMultiDomainsReady(this.page, options);
  }

  async open(): Promise<void> {
    await this.page.goto(URLS.admin + 'chat/multi-domains');
    await this.waitForReady();
  }

  async assertPageIsShown(): Promise<void> {
    await expect(this.headingMultidomains, 'Multidomains never rendered its heading').toBeVisible();
    await expect(this.buttonAddNew, 'The page offers no way to add a domain').toBeVisible();
    await expect(this.buttonSave, 'The page offers no way to save the domains').toBeVisible();
  }

  async domainRowCount({ timeout = ACTION_TIMEOUT }: RouteReadyOptions = {}): Promise<number> {
    await expect(
      this.inputsDomainName.first(),
      'Multidomains rendered its heading but never received a domain row',
    ).toBeVisible({ timeout });

    return this.inputsDomainName.count();
  }

  async assertRowsAreComplete(): Promise<void> {
    const rows = await this.domainRowCount();

    await expect(this.inputsDomainUrl, 'A domain was listed without its URL field').toHaveCount(rows);
    await expect(this.buttonsDeleteDomain, 'A domain was listed with no way to remove it').toHaveCount(rows);
  }

  async assertOnlyDomainCannotBeDeleted(): Promise<void> {
    await expect(this.inputsDomainName, 'The form was expected to hold a single domain').toHaveCount(1);
    await expect(
      this.buttonsDeleteDomain.first(),
      'The last domain left was still offered for deletion',
    ).toBeDisabled();
  }

  async addDomainRow(): Promise<void> {
    const rowsBefore = await this.domainRowCount();

    await this.buttonAddNew.click();
    await expect(this.inputsDomainName, 'The page never added the domain row it was asked for').toHaveCount(
      rowsBefore + 1,
    );
  }

  async removeDomainRowsUntilOneLeft(): Promise<void> {
    for (let rows = await this.domainRowCount(); rows > 1; rows--) {
      await this.buttonsDeleteDomain.last().click();
      await expect(this.inputsDomainName, 'The form kept the domain row that was removed').toHaveCount(rows - 1);
    }
  }

  async fillLastDomainRow(domainName: string, domainUrl: string): Promise<void> {
    await this.inputsDomainName.last().fill(domainName);
    await this.inputsDomainUrl.last().fill(domainUrl);
  }

  async saveDomains(): Promise<void> {
    await this.buttonSave.click();
  }

  async assertSaveWasConfirmed({ timeout = ACTION_TIMEOUT }: RouteReadyOptions = {}): Promise<void> {
    await expect(this.toastList, 'Saving the domains raised no notification').toContainText('Updated Successfully', {
      timeout,
    });
  }

  async assertDomainStored(domainName: string, domainUrl: string): Promise<void> {
    const row = await this.domainRowIndex(domainName);

    expect(row, `The domains list holds no "${domainName}"`).toBeGreaterThan(-1);
    await expect(this.inputsDomainUrl.nth(row), `"${domainName}" came back with a different URL`).toHaveValue(
      domainUrl,
    );
  }

  async assertDomainNotListed(domainName: string): Promise<void> {
    expect(await this.domainRowIndex(domainName), `The domains list still holds "${domainName}"`).toBe(-1);
  }

  async assertDomainListedOnce(domainName: string): Promise<void> {
    const listed = (await this.listedDomainNames()).filter((name) => name === domainName).length;

    expect(listed, `The domains list holds "${domainName}" ${listed} times`).toBe(1);
  }

  async hasDomain(domainName: string): Promise<boolean> {
    return (await this.domainRowIndex(domainName)) > -1;
  }

  async updateDomainByName(currentName: string, nextName: string, nextUrl: string): Promise<void> {
    const row = await this.domainRowIndex(currentName);

    expect(row, `The domains list holds no "${currentName}" to edit`).toBeGreaterThan(-1);

    await this.inputsDomainName.nth(row).fill(nextName);
    await this.inputsDomainUrl.nth(row).fill(nextUrl);

    await this.assertDomainListedOnce(nextName);
    await this.assertDomainNotListed(currentName);
    await expect(this.inputsDomainUrl.nth(row), `The edit left "${nextName}" with a different URL`).toHaveValue(
      nextUrl,
    );
  }

  async deleteDomainByName(domainName: string): Promise<void> {
    const row = await this.domainRowIndex(domainName);

    expect(row, `The domains list holds no "${domainName}" to delete`).toBeGreaterThan(-1);

    const rowsBefore = await this.domainRowCount();

    await this.buttonsDeleteDomain.nth(row).click();
    await expect(this.inputsDomainName, 'The form kept the domain row that was removed').toHaveCount(rowsBefore - 1);
    await this.assertDomainNotListed(domainName);
  }

  private async domainRowIndex(domainName: string): Promise<number> {
    return (await this.listedDomainNames()).indexOf(domainName);
  }

  private async listedDomainNames(): Promise<string[]> {
    await this.domainRowCount();

    return this.inputsDomainName.evaluateAll((inputs) => inputs.map((input) => (input as HTMLInputElement).value));
  }
}
