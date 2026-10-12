import { Locator, Page, expect } from '@playwright/test';

import { ACTION_TIMEOUT, TABLE_PAGE_TURN_TIMEOUT, TABLE_SETTLE_TIMEOUT } from '@utils/constants';
import { ExpectRowOptions, FindRowOptions, PaginatedDataTableOptions, RouteReadyOptions } from '@utils/interfaces';

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export class PaginatedDataTable {
  private readonly page: Page;
  private readonly table: Locator;
  private readonly rowLabelSelector: string;
  private readonly defaultPageSize: string;
  private readonly pageSizeSelect?: Locator;

  constructor(page: Page, options: PaginatedDataTableOptions) {
    this.page = page;
    this.table = options.table;
    this.rowLabelSelector = options.rowLabelSelector ?? 'td >> label';
    this.defaultPageSize = options.defaultPageSize ?? '50';
    this.pageSizeSelect = options.pageSizeSelect;
  }

  async waitUntilReady({ timeout = ACTION_TIMEOUT }: RouteReadyOptions = {}): Promise<void> {
    await expect(this.table).toBeVisible({ timeout });
    await expect(this.getRows().first(), 'Data table rendered its frame but never received rows').toBeVisible({
      timeout,
    });
    await this.waitForRowsToSettle();
  }

  private async rowsSignature(): Promise<string> {
    return this.getRows()
      .evaluateAll(
        (rows) =>
          `${rows.length}:${(rows[0]?.textContent ?? '').trim()}:${(rows[rows.length - 1]?.textContent ?? '').trim()}`,
      )
      .catch(() => '');
  }

  // The rows the table shows lag behind the page it says it is on: the paging control marks
  // the new page at once, while the rows of the page just left stay on screen for close to a
  // second after. Both waits below read that lag off the same sampling loop — one waits for
  // two readings to agree, the other for the first reading that differs from what was there
  // before the click.
  private async pollRows(
    accept: (current: string, previous: string) => boolean,
    { initial, interval, timeout }: { initial?: string; interval: number; timeout: number },
  ): Promise<boolean> {
    const deadline = Date.now() + timeout;
    let previous = initial ?? (await this.rowsSignature());

    while (Date.now() < deadline) {
      await this.page.waitForTimeout(interval);
      const current = await this.rowsSignature();

      if (accept(current, previous)) {
        return true;
      }

      previous = current;
    }

    return false;
  }

  private async waitForRowsToSettle(): Promise<void> {
    await this.pollRows((current, previous) => current === previous, { interval: 350, timeout: TABLE_SETTLE_TIMEOUT });
  }

  private async waitForRowsToChange(before: string): Promise<boolean> {
    return this.pollRows((current, previous) => current !== previous, {
      initial: before,
      interval: 200,
      timeout: TABLE_PAGE_TURN_TIMEOUT,
    });
  }

  getRows(): Locator {
    return this.table.locator('tbody tr');
  }

  getRowByText(text: string): Locator {
    const normalized = text.trim();
    const exactCellText = new RegExp(`^\\s*${escapeRegex(normalized)}\\s*$`);
    const rowText = new RegExp(`(^|\\s)${escapeRegex(normalized)}(\\s|$)`);

    return this.getRows()
      .filter({
        has: this.page.locator('td, [role="cell"]').filter({ hasText: exactCellText }).first(),
      })
      .or(this.getRows().filter({ hasText: rowText }));
  }

  // The paging controls sit beside the table rather than inside it: the component wraps the
  // table, its page size and its page buttons together. Looking for them within the table
  // element finds nothing at all, and a search that cannot turn the page silently answers
  // for the first one — which is how a row further down the list reads as missing.
  private pagingControls(): Locator {
    return this.table.locator('xpath=ancestor::*[contains(@class,"data-table")][1]');
  }

  // The button that turns the page carries no caption in this app — it is drawn as an arrow
  // and named only by its class. The text form is kept for a table that does label it.
  private nextPageButton(): Locator {
    const controls = this.pagingControls();

    return controls
      .locator('button.next')
      .or(controls.locator('button, a').filter({ hasText: /^(->|→|›|next)$/i }))
      .last();
  }

  async goToFirstPage(): Promise<void> {
    const firstPageButton = this.pagingControls().locator('button, a').filter({ hasText: /^1$/ }).first();

    if (!(await firstPageButton.isVisible().catch(() => false))) {
      return;
    }

    // Clicking the page the table is already on redraws the rows for nothing, and every walk
    // starts here — the whole list is paged through again before the first row is read.
    if ((await firstPageButton.getAttribute('aria-current').catch(() => null)) === 'true') {
      return;
    }

    await firstPageButton.click({ force: true }).catch(() => {});
    await this.waitUntilReady();
  }

  async findRowAcrossPages(text: string, { maxPages = 10 }: FindRowOptions = {}): Promise<Locator> {
    await this.waitUntilReady();
    await this.goToFirstPage();

    const nextPageButton = this.nextPageButton();

    for (let pageIndex = 0; pageIndex < maxPages; pageIndex++) {
      const row = this.getRowByText(text);
      if (await row.count().catch(() => 0)) {
        return row.first();
      }

      const canAdvance =
        (await nextPageButton.isVisible().catch(() => false)) && (await nextPageButton.isEnabled().catch(() => false));

      if (!canAdvance) {
        break;
      }

      const rowsBefore = await this.rowsSignature();
      await nextPageButton.click({ force: true }).catch(() => {});

      if (!(await this.waitForRowsToChange(rowsBefore))) {
        break;
      }

      await this.waitUntilReady();
    }

    return this.getRowByText(text).first();
  }

  async ensureRowsPerPage(pageSize: string = this.defaultPageSize): Promise<void> {
    if (!this.pageSizeSelect || (await this.pageSizeSelect.count()) === 0) {
      return;
    }

    const currentValue = await this.pageSizeSelect.inputValue().catch(() => null);
    let desiredValue = String(pageSize);

    const options = await this.pageSizeSelect
      .locator('option')
      .evaluateAll((nodes: HTMLOptionElement[]) =>
        nodes.map((node) => String(node.value || node.textContent || '').trim()).filter(Boolean),
      )
      .catch(() => [] as string[]);

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

    const isNativeSelect = await this.pageSizeSelect
      .evaluate((el) => el.tagName?.toLowerCase() === 'select')
      .catch(() => false);
    if (!isNativeSelect) {
      return;
    }

    await this.pageSizeSelect.selectOption(desiredValue);
    await expect(this.pageSizeSelect).toHaveValue(desiredValue, { timeout: ACTION_TIMEOUT });

    await this.waitUntilReady();
  }

  async expectRowVisible(
    text: string,
    { pageSize = this.defaultPageSize, timeout = ACTION_TIMEOUT }: ExpectRowOptions = {},
  ): Promise<void> {
    await this.ensureRowsPerPage(pageSize);
    await expect(await this.findRowAcrossPages(text), `Row "${text}" should be visible in paginated table`).toBeVisible(
      { timeout },
    );
  }

  async expectRowDeleted(
    text: string,
    { pageSize = this.defaultPageSize, timeout = ACTION_TIMEOUT }: ExpectRowOptions = {},
  ): Promise<void> {
    await this.ensureRowsPerPage(pageSize);
    await this.findRowAcrossPages(text);
    await expect(this.getRowByText(text)).toHaveCount(0, { timeout });
  }

  getActionButton(row: Locator, actionName: string): Locator {
    return row.getByRole('button', { name: actionName, exact: true });
  }
}
