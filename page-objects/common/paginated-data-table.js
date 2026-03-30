const { expect } = require('@playwright/test');

class PaginatedDataTable {
  constructor(page, {
    table,
    pageSizeSelect,
    rowLabelSelector = 'td >> label',
    defaultPageSize = '50',
  }) {
    this.page = page;
    this.table = table;
    this.pageSizeSelect = pageSizeSelect;
    this.rowLabelSelector = rowLabelSelector;
    this.defaultPageSize = defaultPageSize;
  }

  async waitUntilReady({ timeout = 15000 } = {}) {
    await expect(this.table).toBeVisible({ timeout });
  }

  getRows() {
    return this.table.locator('tbody tr');
  }

  getRowByText(text) {
    return this.getRows().filter({
      has: this.page.locator(`${this.rowLabelSelector}:has-text("${text}")`),
    });
  }

  async ensureRowsPerPage(pageSize = this.defaultPageSize) {
    if (!this.pageSizeSelect || await this.pageSizeSelect.count() === 0) {
      return;
    }

    const currentValue = await this.pageSizeSelect.inputValue().catch(() => null);
    if (currentValue === String(pageSize)) {
      return;
    }

    await this.pageSizeSelect.selectOption(String(pageSize));
    await this.page.waitForLoadState('networkidle').catch(() => {});
    await this.waitUntilReady();
  }

  async expectRowVisible(text, { pageSize = this.defaultPageSize, timeout = 15000 } = {}) {
    await this.ensureRowsPerPage(pageSize);
    await expect(this.getRowByText(text)).toBeVisible({ timeout });
  }

  async expectRowDeleted(text, { pageSize = this.defaultPageSize, timeout = 15000 } = {}) {
    await this.ensureRowsPerPage(pageSize);
    await expect(this.getRowByText(text)).toHaveCount(0, { timeout });
  }

  getActionButton(row, actionName) {
    return row.getByRole('button', { name: actionName, exact: true });
  }
}

module.exports = { PaginatedDataTable };
