import { Locator, Page, expect } from '@playwright/test';

import { ACTION_TIMEOUT } from '@utils/constants';
import { CopyToDomainOptions, RouteReadyOptions } from '@utils/interfaces';

export class CopyToDomain {
  private readonly page: Page;
  private readonly button: Locator;
  private readonly transferPath: string;
  private readonly dialog: Locator;

  constructor(page: Page, options: CopyToDomainOptions) {
    this.page = page;
    this.button = options.button;
    this.transferPath = options.transferPath;
    this.dialog = this.page.getByRole('dialog');
  }

  async assertIsOffered(): Promise<void> {
    await expect(this.button, 'The page offers no way to copy the settings to another domain').toBeVisible();
  }

  async copyTo(domainName: string, { timeout = ACTION_TIMEOUT }: RouteReadyOptions = {}): Promise<void> {
    await this.button.click();

    await expect(this.dialog, 'Copying the settings opened no dialog').toContainText('Copy to domain');

    const trigger = this.dialog.locator('.select__trigger');
    const options = this.dialog.locator('.select__menu li');

    await trigger.click();

    const option = options.filter({ has: this.page.getByText(domainName, { exact: true }) }).first();

    await option.click();
    await expect(option.locator('input[type="checkbox"]'), `"${domainName}" was not taken as a target`).toBeChecked();

    await trigger.click();
    await expect(options, 'The list of target domains stayed open over the copy control').toHaveCount(0);

    const transferred = this.page.waitForResponse(
      (response) => response.url().includes(this.transferPath) && response.request().method() === 'POST',
      { timeout },
    );

    await this.dialog.getByRole('button', { name: 'Copy', exact: true }).click();

    const response = await transferred;

    expect(
      response.ok(),
      `The admin rejected copying the settings onto "${domainName}" (${response.status()})`,
    ).toBeTruthy();

    await expect(this.dialog, 'The copy dialog stayed open after the settings were copied').toBeHidden({ timeout });
  }
}
