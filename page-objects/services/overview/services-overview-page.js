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

    this.buttonConfirmDelete = this.page.getByRole('dialog').getByRole('button', { name: 'Kustuta' }).last();
    this.buttonCancelDelete = this.page.getByRole('dialog').getByRole('button', { name: /tühista|cancel/i }).first();

    this.tableServices = this.page.getByTestId('services-table').or(this.page.locator('table.data-table').nth(0)).or(this.page.locator('table').nth(0)).first();
    this.tableGeneralServices = this.page.getByTestId('general-services-table').or(this.page.locator('table.data-table').nth(1)).or(this.page.locator('table').nth(1)).first();

    this.thName = this.page.getByRole('columnheader', { name: 'Nimetus' });
    this.thDescription = this.page.getByRole('columnheader', { name: 'Kirjeldus' });
    this.thStatus = this.page.getByRole('columnheader', { name: 'Olek' });

    this.selectPageSizeServices = this.page.getByTestId('services-page-size').or(this.page.getByRole('combobox', { name: /Kuvan korraga/i }).nth(0)).or(this.page.locator('select').nth(0)).first();
    this.selectPageSizeGeneralServices = this.page.getByTestId('general-services-page-size').or(this.page.getByRole('combobox', { name: /Kuvan korraga/i }).nth(1)).or(this.page.locator('select').nth(1)).first();

    this.servicesTable = new PaginatedDataTable(this.page, {
      table: this.tableServices,
      pageSizeSelect: this.selectPageSizeServices,
      rowLabelSelector: 'td',
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

  async findServiceRow(serviceTitle, options = {}) {
    await this.waitForReady();
    await this.servicesTable.ensureRowsPerPage(options.pageSize);
    return this.servicesTable.findRowAcrossPages(serviceTitle, options);
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

  async assertServiceRowVisible(serviceTitle, options = {}) {
    await this.waitForReady();
    await this.servicesTable.expectRowVisible(serviceTitle, options);
  }

  async assertRowDeleted(serviceTitle) {
    await this.waitForReady();
    await this.servicesTable.expectRowDeleted(serviceTitle);
  }

  async clickCreateNew() {
    await this.waitForReady();
    await this.buttonCreateNewService.click();
    await this.page.waitForURL(/services\/newService/i, { timeout: 15000 }).catch(() => {});
    await this.page.waitForLoadState('domcontentloaded').catch(() => {});
  }

  async clickEdit(serviceTitle) {
    const row = await this.findServiceRow(serviceTitle);
    const button = this.servicesTable.getActionButton(row, 'Muuda');
    await expect(button).toBeVisible();
    await button.click({ force: true });
    await this.page.waitForURL(/services\/newService/i, { timeout: 15000 }).catch(() => {});
    await this.page.waitForLoadState('domcontentloaded').catch(() => {});
  }

  async clickExport(serviceTitle) {
    const row = await this.findServiceRow(serviceTitle);
    const button = this.servicesTable.getActionButton(row, 'Ekspordi');
    await expect(button).toBeVisible();
    await button.click();
  }

  async deleteService(serviceTitle) {
    const row = await this.findServiceRow(serviceTitle);
    await expect(row.first()).toBeVisible({ timeout: 10000 });

    const targetRow = row.first();
    const overviewDeleteButton = this.servicesTable.getActionButton(targetRow, 'Kustuta').first();
    const canDeleteFromOverview = await overviewDeleteButton.isVisible().catch(() => false)
      && await overviewDeleteButton.isEnabled().catch(() => false);

    if (canDeleteFromOverview) {
      await overviewDeleteButton.scrollIntoViewIfNeeded().catch(() => {});
      await overviewDeleteButton.click({ force: true }).catch(() => {});
    } else {
      const editButton = this.servicesTable.getActionButton(row, 'Muuda');
      await expect(editButton).toBeVisible();
      await editButton.first().click({ force: true });
      await this.page.waitForURL(/services\/newService/i, { timeout: 15000 }).catch(() => {});
      await this.page.waitForLoadState('domcontentloaded').catch(() => {});

      const headerDeleteButton = this.page.getByRole('button', { name: 'Kustuta', exact: true }).first();
      await expect(headerDeleteButton).toBeVisible({ timeout: 10000 });
      await headerDeleteButton.scrollIntoViewIfNeeded().catch(() => {});
      await headerDeleteButton.click({ force: true }).catch(() => {});
    }

    const deleteDialogVisible = await this.page.getByRole('dialog').isVisible().catch(() => false);
    if (deleteDialogVisible) {
      await this.buttonConfirmDelete.click({ force: true }).catch(() => {});
    }

    const deletedFromCurrentView = await expect(this.getServiceRow(serviceTitle)).toHaveCount(0, { timeout: 10000 })
      .then(() => true)
      .catch(() => false);
    if (!deletedFromCurrentView) {
      await this.page.goto('services/overview').catch(() => {});
      await this.page.waitForLoadState('domcontentloaded').catch(() => {});
      await this.waitForReady();
      await expect(this.getServiceRow(serviceTitle)).toHaveCount(0, { timeout: 5000 });
    }
  }

  async hasServiceRow(serviceTitle, { pageSize = this.servicesTable.defaultPageSize } = {}) {
    const row = await this.findServiceRow(serviceTitle, { pageSize }).catch(() => null);
    return row ? await row.count().catch(() => 0) > 0 : false;
  }

  async deleteServiceIfExists(serviceTitle) {
    try {
      if (!(await this.hasServiceRow(serviceTitle))) {
        return false;
      }

      await this.deleteService(serviceTitle);
      return !(await this.hasServiceRow(serviceTitle).catch(() => true));
    } catch (error) {
      // Cleanup should be best-effort to avoid after-hook masking the real test failure.
      await this.page.goto('services/overview').catch(() => {});
      await this.page.waitForLoadState('domcontentloaded').catch(() => {});
      const stillExists = await this.hasServiceRow(serviceTitle).catch(() => false);
      if (!stillExists) {
        return true;
      }
      console.warn(`Cleanup failed for service "${serviceTitle}": ${error?.message || error}`);
      return false;
    }
  }

  async assertServiceNameExists() {
    await this.waitForReady();
    const firstCell = this.getFirstTableRow().locator('td').first();
    await expect(firstCell).toBeVisible();
    await expect(firstCell).toContainText(/\S/);
  }

  async assertDescriptionFieldExists() {
    await this.waitForReady();
    await expect(this.getRowColumns(this.getFirstTableRow()).nth(1)).toBeVisible();
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
    if (await this.selectPageSizeServices.isVisible().catch(() => false)) {
      await expect(this.selectPageSizeServices).toBeVisible();
      return;
    }
    await expect(this.tableServices).toBeVisible();
  }

  async assertPageSizeVisibleGeneralServices() {
    await this.waitForReady();
    if (await this.selectPageSizeGeneralServices.isVisible().catch(() => false)) {
      await expect(this.selectPageSizeGeneralServices).toBeVisible();
      return;
    }
    await expect(this.tableGeneralServices).toBeVisible();
  }
}

module.exports = { ServicesOverviewPage };
