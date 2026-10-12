import { Locator, Page, Request, expect } from '@playwright/test';

import { ACTION_TIMEOUT, WIDGET_DOMAINS_PATH } from '@utils/constants';
import { URLS } from '@utils/env';
import { RouteReadyOptions, WidgetDomain } from '@utils/interfaces';
import { assertLeavingRaisesNoPrompt, waitForMultiDomainsReady } from '@utils/waits';

type DomainField = 'name' | 'url';

export class MultiDomainsPage {
  private readonly page: Page;

  private readonly inputsDomainName: Locator;
  private readonly inputsDomainUrl: Locator;

  private readonly buttonsDeleteDomain: Locator;
  private readonly buttonAddNew: Locator;
  private readonly buttonSave: Locator;

  private readonly sectionDomains: Locator;
  private readonly headingMultidomains: Locator;
  private readonly toastList: Locator;

  constructor(page: Page) {
    this.page = page;

    this.inputsDomainName = this.page.locator('main input[name^="widgetDomains."][name$=".name"]');
    this.inputsDomainUrl = this.page.locator('main input[name^="widgetDomains."][name$=".url"]');

    this.buttonsDeleteDomain = this.page.locator('main button.btn--error');
    this.buttonAddNew = this.page.getByRole('button', { name: 'Add new', exact: true });
    this.buttonSave = this.page.getByRole('button', { name: 'Save', exact: true });

    this.sectionDomains = this.page.locator('main');
    this.headingMultidomains = this.page.getByRole('heading', { name: 'Multidomains', exact: true });
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

  async assertRowsNumbered(): Promise<void> {
    const rows = await this.domainRowCount();

    for (let row = 0; row < rows; row++) {
      await expect(this.nameInputNumbered(row), `Row ${row + 1} carries no numbered name label`).toBeVisible();
    }
  }

  async assertRowsHold(domains: readonly WidgetDomain[]): Promise<void> {
    await expect(
      this.inputsDomainName,
      'The form lists a different number of domains than the back office holds',
    ).toHaveCount(domains.length);

    for (const [row, domain] of domains.entries()) {
      await expect(this.inputsDomainName.nth(row), `Row ${row + 1} came back with a different name`).toHaveValue(
        domain.name,
      );
      await expect(this.inputsDomainUrl.nth(row), `Row ${row + 1} came back with a different URL`).toHaveValue(
        domain.url,
      );
    }
  }

  async assertDomainsStored(domains: readonly WidgetDomain[]): Promise<void> {
    for (const domain of domains) {
      await this.assertDomainStored(domain.name, domain.url);
    }
  }

  async assertLastRowIsEmpty(): Promise<void> {
    const rows = await this.domainRowCount();

    await expect(this.nameInputNumbered(rows - 1), 'The new row came without its number or with a name').toHaveValue(
      '',
    );
    await expect(this.inputsDomainUrl.last(), 'The new row came with a URL filled in').toHaveValue('');
    await expect(this.buttonsDeleteDomain.last(), 'The new row offers no way to remove it').toBeEnabled();
  }

  async assertLastRowHolds(domainName: string, domainUrl: string): Promise<void> {
    await expect(this.inputsDomainName.last(), 'The last row holds a different name than the one typed').toHaveValue(
      domainName,
    );
    await expect(this.inputsDomainUrl.last(), 'The last row holds a different URL than the one typed').toHaveValue(
      domainUrl,
    );
  }

  async assertDuplicateMarked(message: string, field: DomainField, value: string): Promise<void> {
    const rows = this.domainRow(field, value);

    expect(await rows.count(), `The form holds no row with the ${field} "${value}"`).toBeGreaterThan(0);
    await expect(rows.getByText(message, { exact: true }), `A clashing row was not marked "${message}"`).toHaveCount(
      await rows.count(),
    );
  }

  async assertDuplicateNotMarked(message: string, field?: DomainField, value?: string): Promise<void> {
    const scope = field && value !== undefined ? this.domainRow(field, value) : this.sectionDomains;

    await expect(scope.getByText(message, { exact: true }), `A row is still marked "${message}"`).toHaveCount(0);
  }

  async assertSaveRefused(reason: string): Promise<void> {
    const saved = this.page
      .waitForRequest((request) => this.isDomainsSave(request), { timeout: ACTION_TIMEOUT })
      .then(
        () => true,
        () => false,
      );

    await this.buttonSave.click();

    expect(await saved, reason).toBe(false);
    await expect(this.toastList, reason).not.toContainText('Updated Successfully');
  }

  async assertNothingSaved(action: () => Promise<void>, reason: string): Promise<void> {
    const saves: string[] = [];
    const recordSave = (request: Request): void => {
      if (this.isDomainsSave(request)) {
        saves.push(request.postData() ?? '');
      }
    };

    this.page.on('request', recordSave);

    try {
      await action();
    } finally {
      this.page.off('request', recordSave);
    }

    expect(saves, reason).toEqual([]);
  }

  async saveReadingPostedDomains(): Promise<WidgetDomain[]> {
    const saved = this.page.waitForRequest((request) => this.isDomainsSave(request));

    await this.buttonSave.click();

    const { widgetDomains } = (await saved).postDataJSON() as { widgetDomains: string };

    return JSON.parse(widgetDomains) as WidgetDomain[];
  }

  async assertLeavingRaisesNoPrompt(leave: () => Promise<void>): Promise<void> {
    await assertLeavingRaisesNoPrompt(this.page, leave);
  }

  private async domainRowIndex(domainName: string): Promise<number> {
    return (await this.listedDomainNames()).indexOf(domainName);
  }

  private async listedDomainNames(): Promise<string[]> {
    await this.domainRowCount();

    return this.inputsDomainName.evaluateAll((inputs) => inputs.map((input) => (input as HTMLInputElement).value));
  }

  private domainRow(field: DomainField, value: string): Locator {
    return this.sectionDomains.locator('.track').filter({
      has: this.page.locator(`input[name$=".${field}"][value=${JSON.stringify(value)}]`),
    });
  }

  private nameInputNumbered(row: number): Locator {
    return this.page.getByRole('textbox', { name: `${row + 1}. Domain name`, exact: true });
  }

  private isDomainsSave(request: Request): boolean {
    return request.method() === 'POST' && request.url().includes(WIDGET_DOMAINS_PATH);
  }
}
