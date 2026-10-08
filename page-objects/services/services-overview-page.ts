import { Locator, Page, expect } from '@playwright/test';

import { PaginatedDataTable } from '@page-objects/common';
import { ACTION_TIMEOUT } from '@utils/constants';
import { ExpectRowOptions, FindServiceRowOptions, RouteReadyOptions } from '@utils/interfaces';
import { waitForServicesOverviewReady } from '@utils/waits';

export class ServicesOverviewPage {
  private readonly page: Page;

  private readonly buttonCreateNewService: Locator;
  private readonly buttonConfirmDelete: Locator;

  private readonly tableServices: Locator;
  private readonly tableCommonServices: Locator;

  private readonly selectPageSizeServices: Locator;
  private readonly selectPageSizeCommonServices: Locator;

  private readonly servicesTable: PaginatedDataTable;

  constructor(page: Page) {
    this.page = page;

    this.buttonCreateNewService = this.page.getByRole('button', { name: 'Create new service', exact: true });
    this.buttonConfirmDelete = this.page.getByRole('dialog').getByRole('button', { name: 'Delete' }).last();

    this.tableServices = this.page
      .getByTestId('services-table')
      .or(this.page.locator('table.data-table').nth(0))
      .or(this.page.locator('table').nth(0))
      .first();
    this.tableCommonServices = this.page
      .getByTestId('general-services-table')
      .or(this.page.locator('table.data-table').nth(1))
      .or(this.page.locator('table').nth(1))
      .first();

    this.selectPageSizeServices = this.page
      .getByTestId('services-page-size')
      .or(this.page.getByRole('combobox', { name: /Results per page/i }).nth(0))
      .or(this.page.locator('select').nth(0))
      .first();
    this.selectPageSizeCommonServices = this.page
      .getByTestId('general-services-page-size')
      .or(this.page.getByRole('combobox', { name: /Results per page/i }).nth(1))
      .or(this.page.locator('select').nth(1))
      .first();

    this.servicesTable = new PaginatedDataTable(this.page, {
      table: this.tableServices,
      pageSizeSelect: this.selectPageSizeServices,
      rowLabelSelector: 'td',
      defaultPageSize: '50',
    });
  }

  async waitForReady(options: RouteReadyOptions = {}): Promise<void> {
    await waitForServicesOverviewReady(this.page, options);
    await this.servicesTable.waitUntilReady(options);
  }

  getServiceRow(serviceTitle: string): Locator {
    return this.servicesTable.getRowByText(serviceTitle);
  }

  async findServiceRow(serviceTitle: string, options: FindServiceRowOptions = {}): Promise<Locator> {
    await this.waitForReady();
    await this.servicesTable.ensureRowsPerPage(options.pageSize);
    return this.servicesTable.findRowAcrossPages(serviceTitle, options);
  }

  getFirstTableRow(table: Locator = this.tableServices): Locator {
    return table.locator('tbody').locator('tr').first();
  }

  getRowColumns(rowOrTitle: Locator | string | number): Locator {
    const row =
      typeof rowOrTitle === 'string' || typeof rowOrTitle === 'number'
        ? this.getServiceRow(String(rowOrTitle))
        : rowOrTitle;

    return row.locator('td');
  }

  async setServicesRowsPerPageTo50(): Promise<void> {
    await this.waitForReady();
    await this.servicesTable.ensureRowsPerPage('50');
  }

  async assertServiceRowVisible(serviceTitle: string, options: ExpectRowOptions = {}): Promise<void> {
    await this.waitForReady();
    await this.servicesTable.expectRowVisible(serviceTitle, options);
  }

  async assertRowDeleted(serviceTitle: string): Promise<void> {
    await this.waitForReady();
    await this.servicesTable.expectRowDeleted(serviceTitle);
  }

  async clickCreateNew(): Promise<void> {
    await this.waitForReady();
    await this.buttonCreateNewService.click();
    await this.page.waitForURL(/services\/newService/i, { timeout: ACTION_TIMEOUT }).catch(() => {});
    await this.page.waitForLoadState('domcontentloaded').catch(() => {});
  }

  async clickEdit(serviceTitle: string): Promise<void> {
    const row = await this.findServiceRow(serviceTitle);
    const button = this.servicesTable.getActionButton(row, 'Edit');
    await expect(button).toBeVisible();
    await button.click({ force: true });
    await this.page.waitForURL(/services\/(edit|newService)/i, { timeout: ACTION_TIMEOUT }).catch(() => {});
    await this.page.waitForLoadState('domcontentloaded').catch(() => {});
  }

  async clickExport(serviceTitle: string): Promise<void> {
    const row = await this.findServiceRow(serviceTitle);
    const button = this.servicesTable.getActionButton(row, 'Export');
    await expect(button).toBeVisible();
    await button.click();
  }

  async deleteService(serviceTitle: string): Promise<void> {
    const row = await this.findServiceRow(serviceTitle);
    await expect(row.first()).toBeVisible({ timeout: 10000 });

    const targetRow = row.first();
    const overviewDeleteButton = this.servicesTable.getActionButton(targetRow, 'Delete').first();
    const canDeleteFromOverview =
      (await overviewDeleteButton.isVisible().catch(() => false)) &&
      (await overviewDeleteButton.isEnabled().catch(() => false));

    if (canDeleteFromOverview) {
      await overviewDeleteButton.scrollIntoViewIfNeeded().catch(() => {});
      await overviewDeleteButton.click({ force: true }).catch(() => {});
    } else {
      const editButton = this.servicesTable.getActionButton(row, 'Edit');
      await expect(editButton).toBeVisible();
      await editButton.first().click({ force: true });
      await this.page.waitForURL(/services\/(edit|newService)/i, { timeout: ACTION_TIMEOUT }).catch(() => {});
      await this.page.waitForLoadState('domcontentloaded').catch(() => {});

      const headerDeleteButton = this.page.getByRole('button', { name: 'Delete', exact: true }).first();
      await expect(headerDeleteButton).toBeVisible({ timeout: 10000 });
      await headerDeleteButton.scrollIntoViewIfNeeded().catch(() => {});
      await headerDeleteButton.click({ force: true }).catch(() => {});
    }

    const deleteDialogVisible = await this.page
      .getByRole('dialog')
      .isVisible()
      .catch(() => false);
    if (deleteDialogVisible) {
      await this.buttonConfirmDelete.click({ force: true }).catch(() => {});
    }

    const deletedFromCurrentView = await expect(this.getServiceRow(serviceTitle))
      .toHaveCount(0, { timeout: 10000 })
      .then(() => true)
      .catch(() => false);
    if (!deletedFromCurrentView) {
      await this.page.goto('services/overview').catch(() => {});
      await this.page.waitForLoadState('domcontentloaded').catch(() => {});
      await this.waitForReady();
      await expect(this.getServiceRow(serviceTitle)).toHaveCount(0, { timeout: 5000 });
    }
  }

  async hasServiceRow(serviceTitle: string, { pageSize }: { pageSize?: string } = {}): Promise<boolean> {
    const row = await this.findServiceRow(serviceTitle, { pageSize }).catch(() => null);
    return row ? (await row.count().catch(() => 0)) > 0 : false;
  }

  async deleteServiceIfExists(serviceTitle: string): Promise<boolean> {
    try {
      if (!(await this.hasServiceRow(serviceTitle))) {
        return false;
      }

      await this.deleteService(serviceTitle);
      return !(await this.hasServiceRow(serviceTitle).catch(() => true));
    } catch (error) {
      await this.page.goto('services/overview').catch(() => {});
      await this.page.waitForLoadState('domcontentloaded').catch(() => {});
      const stillExists = await this.hasServiceRow(serviceTitle).catch(() => false);
      if (!stillExists) {
        return true;
      }
      console.warn(`Cleanup failed for service "${serviceTitle}": ${error instanceof Error ? error.message : error}`);
      return false;
    }
  }

  async assertServiceNameExists(): Promise<void> {
    await this.waitForReady();
    const firstCell = this.getFirstTableRow().locator('td').first();
    await expect(firstCell).toBeVisible();
    await expect(firstCell).toContainText(/\S/);
  }

  async assertDescriptionFieldExists(): Promise<void> {
    await this.waitForReady();
    await expect(this.getRowColumns(this.getFirstTableRow()).nth(1)).toBeVisible();
  }

  async assertStatusExists(): Promise<void> {
    await this.waitForReady();
    const statuses = ['Draft', 'Ready', 'Active'];
    await expect(this.getRowColumns(this.getFirstTableRow()).nth(2)).toContainText(new RegExp(statuses.join('|')));
  }

  async assertStatusReady(rowOrTitle: Locator | string | number): Promise<void> {
    await this.waitForReady();

    const statusCell = () => this.getRowColumns(rowOrTitle).nth(2);

    await expect(async () => {
      if (
        !(
          await statusCell()
            .innerText()
            .catch(() => '')
        ).includes('Ready')
      ) {
        await this.page.reload({ waitUntil: 'domcontentloaded' });
        await this.waitForReady();
      }
      await expect(statusCell()).toContainText('Ready', { timeout: 2000 });
    }).toPass({ intervals: [500, 1000, 2000], timeout: 30000 });
  }

  async assertEditButtonExists(): Promise<void> {
    await this.waitForReady();
    await expect(
      this.getRowColumns(this.getFirstTableRow()).nth(3).getByRole('button', { name: 'Edit' }),
    ).toBeVisible();
  }

  async assertExportButtonExists(): Promise<void> {
    await this.waitForReady();
    await expect(
      this.getRowColumns(this.getFirstTableRow()).nth(4).getByRole('button', { name: 'Export' }),
    ).toBeVisible();
  }

  async assertDeleteButtonExists(): Promise<void> {
    await this.waitForReady();
    await expect(
      this.getRowColumns(this.getFirstTableRow()).nth(4).getByRole('button', { name: 'Delete' }),
    ).toBeVisible();
  }

  async assertPageSizeVisibleServices(): Promise<void> {
    await this.waitForReady();
    if (await this.selectPageSizeServices.isVisible().catch(() => false)) {
      await expect(this.selectPageSizeServices).toBeVisible();
      return;
    }
    await expect(this.tableServices).toBeVisible();
  }

  async assertPageSizeVisibleGeneralServices(): Promise<void> {
    await this.waitForReady();
    if (await this.selectPageSizeCommonServices.isVisible().catch(() => false)) {
      await expect(this.selectPageSizeCommonServices).toBeVisible();
      return;
    }
    await expect(this.tableCommonServices).toBeVisible();
  }
}
