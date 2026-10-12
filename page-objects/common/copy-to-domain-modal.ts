import { Locator, Page, expect } from '@playwright/test';

import { ACTION_TIMEOUT } from '@utils/constants';
import { CopyToDomainModalOptions, RouteReadyOptions } from '@utils/interfaces';

export class CopyToDomainModal {
  private readonly page: Page;
  private readonly button: Locator;
  private readonly transferPath: string;
  private readonly dialog: Locator;

  private readonly headingCopyToDomain: Locator;
  private readonly noteCopyToDomain: Locator;

  private readonly triggerTargets: Locator;
  private readonly optionsTargets: Locator;

  private readonly buttonCopy: Locator;
  private readonly buttonCancel: Locator;
  private readonly buttonClose: Locator;

  constructor(page: Page, options: CopyToDomainModalOptions) {
    this.page = page;
    this.button = options.button;
    this.transferPath = options.transferPath;
    this.dialog = this.page.getByRole('dialog');

    this.headingCopyToDomain = this.dialog.getByRole('heading', { name: 'Copy to domain', exact: true });
    this.noteCopyToDomain = this.dialog.getByText(
      'Select the domains to which the current settings will be copied to.',
      { exact: true },
    );

    this.triggerTargets = this.dialog.locator('.select__trigger');
    this.optionsTargets = this.dialog.locator('.select__menu li');

    this.buttonCopy = this.dialog.getByRole('button', { name: 'Copy', exact: true });
    this.buttonCancel = this.dialog.getByRole('button', { name: 'Cancel', exact: true });
    this.buttonClose = this.dialog.locator('.dialog__close');
  }

  async assertIsOffered(): Promise<void> {
    await expect(this.button, 'The page offers no way to copy the settings to another domain').toBeVisible();
  }

  async open(): Promise<void> {
    await this.button.click();
    await expect(this.dialog, 'Copying the settings opened no dialog').toContainText('Copy to domain');
  }

  async copyTo(domainName: string, { timeout = ACTION_TIMEOUT }: RouteReadyOptions = {}): Promise<void> {
    await this.open();
    await this.openTargets();
    await this.toggleTarget(domainName);
    await expect(
      this.targetOption(domainName).locator('input[type="checkbox"]'),
      `"${domainName}" was not taken as a target`,
    ).toBeChecked();
    await this.closeTargets();

    const transferred = this.page.waitForResponse(
      (response) => response.url().includes(this.transferPath) && response.request().method() === 'POST',
      { timeout },
    );

    await this.buttonCopy.click();

    const response = await transferred;

    expect(
      response.ok(),
      `The admin rejected copying the settings onto "${domainName}" (${response.status()})`,
    ).toBeTruthy();

    await expect(this.dialog, 'The copy dialog stayed open after the settings were copied').toBeHidden({ timeout });
  }

  async assertTitleIsShown(): Promise<void> {
    await expect(this.headingCopyToDomain, 'The copy dialog carries no title').toBeVisible();
  }

  async assertExplanationIsShown(): Promise<void> {
    await expect(this.noteCopyToDomain, 'The copy dialog explains nothing about what it copies').toBeVisible();
  }

  async assertChoiceShows(text: string): Promise<void> {
    await expect(this.triggerTargets, `The target domains control does not read "${text}"`).toContainText(text);
  }

  async assertCopyIsEnabled(): Promise<void> {
    await expect(this.buttonCopy, 'The copy dialog refuses to copy').toBeEnabled();
  }

  async assertCopyIsDisabled(): Promise<void> {
    await expect(this.buttonCopy, 'The copy dialog offers to copy with no target chosen').toBeDisabled();
  }

  async assertCancelIsEnabled(): Promise<void> {
    await expect(this.buttonCancel, 'The copy dialog offers no way to cancel').toBeEnabled();
  }

  async openTargets(): Promise<void> {
    await this.triggerTargets.click();
    await expect(this.optionsTargets.first(), 'The list of target domains never opened').toBeVisible();
  }

  async closeTargets(): Promise<void> {
    await this.triggerTargets.click();
    await expect(this.optionsTargets, 'The list of target domains stayed open over the copy control').toHaveCount(0);
  }

  async assertTargetsOffered(names: string[]): Promise<void> {
    await expect(this.optionsTargets, 'The copy dialog offers a different set of target domains').toHaveText(names);
  }

  async toggleTarget(name: string): Promise<void> {
    await this.targetOption(name).click();
  }

  async cancel(): Promise<void> {
    await this.buttonCancel.click();
  }

  async closeWithEscape(): Promise<void> {
    await this.page.keyboard.press('Escape');
  }

  async closeWithIcon(): Promise<void> {
    await this.buttonClose.click();
  }

  async assertIsClosed(): Promise<void> {
    await expect(this.dialog, 'The copy dialog stayed open').toBeHidden();
  }

  private targetOption(name: string): Locator {
    return this.optionsTargets.filter({ has: this.page.getByText(name, { exact: true }) }).first();
  }
}
