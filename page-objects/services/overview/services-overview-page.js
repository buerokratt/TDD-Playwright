const { expect } = require('@playwright/test');
const { PaginatedDataTable } = require('../../common/paginated-data-table');
const { waitForServicesOverviewReady } = require('../../../utils/waits/admin-page-ready');

class ServicesOverviewPage {
  constructor(page) {
    this.page = page;

    this.headingServices = this.page.getByRole('heading', { name: 'Teenused', exact: true });
    this.headingGeneralServices = this.page.getByRole('heading', { name: 'Üldteenused', exact: true });

    this.buttonImportMany = this.page.getByRole('button', { name: 'Impordi mitu', exact: true });
    this.buttonExportMany = this.page.getByRole('button', { name: 'Ekspordi mitu', exact: true });
    this.buttonCreateNewService = this.page.getByRole('button', { name: 'Loo uus teenus', exact: true });

    this.buttonConfirmDelete = this.page.getByRole('dialog').getByRole('button', { name: 'Kustuta' });

    this.tableServices = this.page.getByTestId('services-table').or(this.page.locator('table.data-table').nth(0)).first();
    this.tableGeneralServices = this.page.getByTestId('general-services-table').or(this.page.locator('table.data-table').nth(1)).first();

    this.thName = this.page.getByRole('columnheader', { name: 'Nimetus' });
    this.thDescription = this.page.getByRole('columnheader', { name: 'Kirjeldus' });
    this.thStatus = this.page.getByRole('columnheader', { name: 'Olek' });

    this.selectPageSizeServices = this.page.getByTestId('services-page-size').or(this.page.locator('label:has-text("Kuvan korraga") + select').nth(0)).first();
    this.selectPageSizeGeneralServices = this.page.getByTestId('general-services-page-size').or(this.page.locator('label:has-text("Kuvan korraga") + select').nth(1)).first();

    this.servicesTable = new PaginatedDataTable(this.page, {
      table: this.tableServices,
      pageSizeSelect: this.selectPageSizeServices,
      rowLabelSelector: 'td >> label',
      defaultPageSize: '50',
    });
  }

  async waitForReady(options = {}) {
    await waitForServicesOverviewReady(this.page, options);
    await this.servicesTable.waitUntilReady(options);
  }

  getServiceRow(serviceTitle) {
    return this.servicesTable.getRowByText(serviceTitle);
  }

  getFirstTableRow(table = this.tableServices) {
    return table.locator('tbody').locator('tr').first();
  }

  getRowColumns(rowOrTitle) {
    const isLocator = rowOrTitle && typeof rowOrTitle.locator === 'function';
    const isTextLike = typeof rowOrTitle === 'string' || typeof rowOrTitle === 'number';
    const row = isLocator ? rowOrTitle : (isTextLike ? this.getServiceRow(String(rowOrTitle)) : null);
    if (!row || typeof row.locator !== 'function') {
      throw new Error(`Expected a row locator or service title, received: ${typeof rowOrTitle}`);
    }
    return row.locator('td');
  }

  async setServicesRowsPerPageTo50() {
    await this.waitForReady();
    await this.servicesTable.ensureRowsPerPage('50');
  }

  async assertServiceRowVisible(serviceTitle) {
    await this.waitForReady();
    await this.servicesTable.expectRowVisible(serviceTitle);
  }

  async assertRowDeleted(serviceTitle) {
    await this.waitForReady();
    await this.servicesTable.expectRowDeleted(serviceTitle);
  }

  async clickCreateNew() {
    await this.waitForReady();
    await this.buttonCreateNewService.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async clickEdit(serviceTitle) {
    await this.waitForReady();
    const row = this.getServiceRow(serviceTitle);
    const button = this.servicesTable.getActionButton(row, 'Muuda');
    await expect(button).toBeVisible();
    await button.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async clickExport(serviceTitle) {
    await this.waitForReady();
    const row = this.getServiceRow(serviceTitle);
    const button = this.servicesTable.getActionButton(row, 'Ekspordi');
    await expect(button).toBeVisible();
    await button.click();
  }

  async deleteService(serviceTitle) {
    await this.waitForReady();
    const row = this.getServiceRow(serviceTitle);
    const button = this.servicesTable.getActionButton(row, 'Kustuta');
    await expect(button).toBeVisible();
    await button.click();

    if (await this.page.getByRole('dialog').isVisible().catch(() => false)) {
      await this.buttonConfirmDelete.click();
    }
  }

  async assertServiceNameExists() {
    await this.waitForReady();
    await expect(this.getFirstTableRow().locator('td').first().locator('label')).toHaveText(/\w/);
  }

  async assertDescriptionFieldExists() {
    await this.waitForReady();
    await expect(this.getRowColumns(this.getFirstTableRow()).nth(1).locator('label')).toBeVisible();
  }

  async assertStatusExists() {
    await this.waitForReady();
    const statuses = ['Mustand', 'Valmis', 'Aktiivne'];
    await expect(this.getRowColumns(this.getFirstTableRow()).nth(2)).toContainText(new RegExp(statuses.join('|')));
  }

  async assertStatusReady(rowOrTitle) {
    await this.waitForReady();
    await expect(this.getRowColumns(rowOrTitle).nth(2)).toContainText('Valmis');
  }

  async assertEditButtonExists() {
    await this.waitForReady();
    await expect(this.getRowColumns(this.getFirstTableRow()).nth(3).getByRole('button', { name: 'Muuda' })).toBeVisible();
  }

  async assertExportButtonExists() {
    await this.waitForReady();
    await expect(this.getRowColumns(this.getFirstTableRow()).nth(4).getByRole('button', { name: 'Ekspordi' })).toBeVisible();
  }

  async assertDeleteButtonExists() {
    await this.waitForReady();
    await expect(this.getRowColumns(this.getFirstTableRow()).nth(5).getByRole('button', { name: 'Kustuta' })).toBeVisible();
  }

  async assertPageSizeVisibleServices() {
    await this.waitForReady();
    await expect(this.selectPageSizeServices).toBeVisible();
  }

  async assertPageSizeVisibleGeneralServices() {
    await this.waitForReady();
    await expect(this.selectPageSizeGeneralServices).toBeVisible();
  }
}

module.exports = { ServicesOverviewPage };
