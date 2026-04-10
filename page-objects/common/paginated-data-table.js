const { expect } = require('@playwright/test');

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

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
    const normalized = String(text).trim();
    const exactCellText = new RegExp(`^\\s*${escapeRegex(normalized)}\\s*$`);
    const rowText = new RegExp(`(^|\\s)${escapeRegex(normalized)}(\\s|$)`);

    return this.getRows().filter({
      has: this.page.locator('td, [role="cell"]').filter({ hasText: exactCellText }).first(),
    }).or(
      this.getRows().filter({ hasText: rowText })
    );
  }

  async goToFirstPage() {
    const firstPageButton = this.table
      .locator('button, a')
      .filter({ hasText: /^1$/ })
      .first();

    if (await firstPageButton.isVisible().catch(() => false)) {
      await firstPageButton.click({ force: true }).catch(() => {});
      await this.waitUntilReady();
    }
  }

  async findRowAcrossPages(text, { maxPages = 10 } = {}) {
    await this.goToFirstPage();

    for (let pageIndex = 0; pageIndex < maxPages; pageIndex++) {
      const row = this.getRowByText(text);
      if (await row.count().catch(() => 0)) {
        return row.first();
      }

      const nextPageButton = this.table
        .locator('button, a')
        .filter({ hasText: /^(->|→|›|next|järgmine)$/i })
        .last();

      const canAdvance = await nextPageButton.isVisible().catch(() => false)
        && await nextPageButton.isEnabled().catch(() => false);

      if (!canAdvance) {
        break;
      }

      await nextPageButton.click({ force: true }).catch(() => {});
      await this.waitUntilReady();
    }

    return this.getRowByText(text).first();
  }

  async ensureRowsPerPage(pageSize = this.defaultPageSize) {
    if (!this.pageSizeSelect || await this.pageSizeSelect.count() === 0) {
      return;
    }

    const currentValue = await this.pageSizeSelect.inputValue().catch(() => null);
    let desiredValue = String(pageSize);

    const options = await this.pageSizeSelect.locator('option').evaluateAll((nodes) =>
      nodes
        .map((node) => String(node.value || node.textContent || '').trim())
        .filter(Boolean)
    ).catch(() => []);

    if (options.length && !options.includes(desiredValue)) {
      const numericOptions = options
        .map((value) => ({ value, numeric: Number.parseInt(value, 10) }))
        .filter((item) => Number.isFinite(item.numeric))
        .sort((a, b) => b.numeric - a.numeric);
      desiredValue = numericOptions[0]?.value || options[options.length - 1];
    }

    if (currentValue === desiredValue) {
      return;
    }

    const isNativeSelect = await this.pageSizeSelect.evaluate((el) => el.tagName?.toLowerCase() === 'select').catch(() => false);
    if (!isNativeSelect) {
      return;
    }

    await this.pageSizeSelect.selectOption(desiredValue).catch(() => null);
    await this.page.waitForLoadState('networkidle').catch(() => {});
    await this.waitUntilReady();
  }

  async expectRowVisible(text, { pageSize = this.defaultPageSize, timeout = 15000 } = {}) {
    await this.ensureRowsPerPage(pageSize);
    await expect(await this.findRowAcrossPages(text), `Row "${text}" should be visible in paginated table`).toBeVisible({ timeout });
  }

  async expectRowDeleted(text, { pageSize = this.defaultPageSize, timeout = 15000 } = {}) {
    await this.ensureRowsPerPage(pageSize);
    await this.findRowAcrossPages(text);
    await expect(this.getRowByText(text)).toHaveCount(0, { timeout });
  }

  getActionButton(row, actionName) {
    return row.getByRole('button', { name: actionName, exact: true });
  }
}

module.exports = { PaginatedDataTable };
