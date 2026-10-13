import { Locator, Page, Response, expect } from '@playwright/test';

import { CopyToDomainModal } from '@page-objects/common';
import {
  ACTION_TIMEOUT,
  SKM_AGENTIC_FIELDS,
  SKM_CONFIG_PATH,
  SKM_NUMBER_FIELDS,
  SKM_RETRIEVAL_FIELDS,
  SKM_SEARCH_TYPES,
  SKM_TRANSFER_PATH,
  SkmField,
} from '@utils/constants';
import { URLS } from '@utils/env';
import { RouteReadyOptions, SkmRetrievalSettings } from '@utils/interfaces';
import { waitForSkmConfigurationReady } from '@utils/waits';

export class SkmConfigurationPage {
  private readonly page: Page;

  private readonly headingSkmConfiguration: Locator;
  private readonly textDescription: Locator;

  private readonly domainTabs: Locator;
  private readonly domainTabActive: Locator;
  private readonly buttonCopyToDomain: Locator;
  private readonly copyToDomain: CopyToDomainModal;

  private readonly switchAgenticRetrieval: Locator;
  private readonly triggerSearchType: Locator;
  private readonly optionsSearchType: Locator;

  private readonly inputClientId: Locator;
  private readonly inputClientSecret: Locator;
  private readonly noteClientIdSaved: Locator;
  private readonly noteClientSecretSaved: Locator;

  private readonly buttonSave: Locator;
  private readonly toastList: Locator;
  private readonly tooltip: Locator;

  constructor(page: Page) {
    this.page = page;

    this.headingSkmConfiguration = this.page.getByRole('heading', { name: 'SKM Configuration', exact: true });
    this.textDescription = this.page.getByText('Here it is possible to set SKM parameters.', { exact: true });

    this.domainTabs = this.page.locator('main .domain-tab-selector__tab');
    this.domainTabActive = this.page.locator('main .domain-tab-selector__tab--active');
    this.buttonCopyToDomain = this.page.getByRole('button', { name: 'Copy to domain', exact: true });
    this.copyToDomain = new CopyToDomainModal(this.page, {
      button: this.buttonCopyToDomain,
      transferPath: SKM_TRANSFER_PATH,
    });

    this.switchAgenticRetrieval = this.field('Use agentic retrieval');
    this.triggerSearchType = this.page.getByRole('combobox', { name: 'Search Type', exact: true });
    this.optionsSearchType = this.page.getByRole('listbox', { name: 'Search Type', exact: true }).getByRole('option');

    this.inputClientId = this.field('Client ID');
    this.inputClientSecret = this.field('Client secret');
    this.noteClientIdSaved = this.page.getByText(
      'A client ID is already saved for this domain. Leave blank to keep it unchanged.',
      { exact: true },
    );
    this.noteClientSecretSaved = this.page.getByText(
      'A secret is already saved for this domain. Leave blank to keep it unchanged.',
      { exact: true },
    );

    this.buttonSave = this.page.getByRole('button', { name: 'Save', exact: true });
    this.toastList = this.page.locator('ol.toast__list');
    this.tooltip = this.page.getByRole('tooltip');
  }

  async waitForReady(options: RouteReadyOptions = {}): Promise<void> {
    await waitForSkmConfigurationReady(this.page, options);
  }

  async open(): Promise<void> {
    const settingsLoaded = this.settingsLoaded();

    await this.page.goto(URLS.admin + 'chat/skm-configuration');
    await this.waitForReady();

    const response = await settingsLoaded;

    expect(response.ok(), `The back office would not read the SKM settings (${response.status()})`).toBeTruthy();
  }

  async assertHeaderIsShown(): Promise<void> {
    await expect(this.headingSkmConfiguration, 'The page never rendered its SKM Configuration heading').toBeVisible();
    await expect(this.textDescription, 'The page explains nothing about what it sets').toBeVisible();
  }

  async assertDomainTabsAreShown(): Promise<void> {
    await expect(this.domainTabs.first(), 'The page rendered no domain tab').toBeVisible();
    await expect(this.domainTabActive, 'The domain tabs left no domain selected').toHaveCount(1);
  }

  async domainTabCount({ timeout = ACTION_TIMEOUT }: RouteReadyOptions = {}): Promise<number> {
    await expect(this.domainTabs.first(), 'The page rendered no domain tab').toBeVisible({ timeout });

    return this.domainTabs.count();
  }

  async domainTabName(index: number): Promise<string> {
    return (await this.domainTabs.nth(index).innerText()).trim();
  }

  async selectDomainTab(index = 0, { timeout = ACTION_TIMEOUT }: RouteReadyOptions = {}): Promise<string> {
    const tab = this.domainTabs.nth(index);

    await expect(tab, `The page rendered no domain tab at position ${index}`).toBeVisible({ timeout });

    const settingsLoaded = this.settingsLoaded({ timeout });

    await tab.click();
    await expect(tab, 'The domain that was picked did not become the selected one').toHaveClass(
      /domain-tab-selector__tab--active/,
      { timeout },
    );

    const response = await settingsLoaded;

    expect(response.ok(), `The back office would not read the SKM settings (${response.status()})`).toBeTruthy();

    const domainId = new URL(response.url()).searchParams.get('domain');

    if (!domainId) {
      throw new Error('The page asked for the SKM settings without a domain id');
    }

    return domainId;
  }

  async copySettingsTo(domainName: string, options: RouteReadyOptions = {}): Promise<void> {
    await this.copyToDomain.copyTo(domainName, options);
  }

  async assertSaveWasConfirmed({ timeout = ACTION_TIMEOUT }: RouteReadyOptions = {}): Promise<void> {
    await expect(this.toastList, 'Saving the SKM settings raised no notification').toContainText(
      'Updated Successfully',
      { timeout },
    );
  }

  async assertControlsAreShown(): Promise<void> {
    await this.copyToDomain.assertIsOffered();
    await expect(this.switchAgenticRetrieval, 'The settings offer no toggle for agentic retrieval').toBeVisible();
    await this.assertTooltipIsOffered('Use agentic retrieval');
    await expect(this.buttonSave, 'The page offers no way to save the SKM settings').toBeVisible();
  }

  async setAgenticRetrieval(on: boolean): Promise<void> {
    await expect(async () => {
      if ((await this.isAgenticRetrievalOn()) !== on) {
        await this.switchAgenticRetrieval.click();
      }

      expect(
        await this.isAgenticRetrievalOn(),
        'The agentic retrieval toggle kept the state it was clicked out of',
      ).toBe(on);
    }).toPass({ timeout: ACTION_TIMEOUT });
  }

  async applyRetrievalSettings(settings: SkmRetrievalSettings): Promise<void> {
    await this.setAgenticRetrieval(false);
    await this.field('Strictness').fill(settings.range);
    await this.field('Found Documents').fill(settings.documents);
    await this.field('Index').fill(settings.indexName);
  }

  async saveSettings(): Promise<void> {
    await this.buttonSave.click();
  }

  async assertRetrievalSettingsStored(settings: SkmRetrievalSettings): Promise<void> {
    await expect(this.field('Strictness'), 'Strictness came back with a value other than the one saved').toHaveValue(
      settings.range,
    );
    await expect(
      this.field('Found Documents'),
      'Found documents came back with a value other than the one saved',
    ).toHaveValue(settings.documents);
    await expect(this.field('Index'), 'Index came back with a value other than the one saved').toHaveValue(
      settings.indexName,
    );
  }

  async assertRetrievalFieldsAreShown(): Promise<void> {
    await this.assertFieldsAreShown(SKM_RETRIEVAL_FIELDS, SKM_AGENTIC_FIELDS);
  }

  async assertAgenticFieldsAreShown(): Promise<void> {
    await this.assertFieldsAreShown(SKM_AGENTIC_FIELDS, SKM_RETRIEVAL_FIELDS);
  }

  async assertSearchTypesAreOffered(): Promise<void> {
    await this.triggerSearchType.click();
    await expect(this.optionsSearchType, 'The search type dropdown offers a different set of options').toHaveText([
      ...SKM_SEARCH_TYPES,
    ]);

    await this.page.keyboard.press('Escape');
    await expect(this.optionsSearchType, 'The search type dropdown stayed open').toHaveCount(0);
  }

  async assertCredentialsAreMasked(): Promise<void> {
    await this.assertCredentialIsMasked(
      this.inputClientId,
      '•••••••• (client ID is set)',
      this.noteClientIdSaved,
      'client ID',
    );
    await this.assertCredentialIsMasked(
      this.inputClientSecret,
      '•••••••• (secret is set)',
      this.noteClientSecretSaved,
      'client secret',
    );
  }

  private async assertFieldsAreShown(shown: readonly SkmField[], hidden: readonly SkmField[]): Promise<void> {
    for (const label of shown) {
      await expect(this.field(label), `The settings show no "${label}" field`).toBeVisible();

      if (SKM_NUMBER_FIELDS.includes(label)) {
        await expect(this.field(label), `The "${label}" field takes more than numbers`).toHaveAttribute(
          'type',
          'number',
        );
      }

      await this.assertTooltipIsOffered(label);
    }

    for (const label of hidden) {
      await expect(this.field(label), `The "${label}" field stayed on in the other retrieval mode`).toBeHidden();
    }
  }

  private async assertCredentialIsMasked(
    input: Locator,
    savedPlaceholder: string,
    savedNote: Locator,
    describedAs: string,
  ): Promise<void> {
    await expect(input, `The ${describedAs} field shows what is typed into it`).toHaveAttribute('type', 'password');

    const placeholder = (await input.getAttribute('placeholder')) ?? '';

    expect(['', savedPlaceholder], `The ${describedAs} field shows the placeholder "${placeholder}"`).toContain(
      placeholder,
    );

    if (placeholder) {
      await expect(savedNote, `A ${describedAs} is saved, yet the field does not say so`).toBeVisible();
      return;
    }

    await expect(savedNote, `No ${describedAs} is saved, yet the field says one is`).toBeHidden();
  }

  private async assertTooltipIsOffered(label: string): Promise<void> {
    await this.fieldRow(label).locator(':scope > span[data-state]').hover();
    await expect(this.tooltip, `The "${label}" field carries no tooltip`).toBeVisible();

    await this.page.keyboard.press('Escape');
    await expect(this.tooltip, `The tooltip of the "${label}" field never closed`).toBeHidden();
  }

  private async isAgenticRetrievalOn(): Promise<boolean> {
    return (await this.switchAgenticRetrieval.getAttribute('aria-checked')) === 'true';
  }

  private settingsLoaded({ timeout = ACTION_TIMEOUT }: RouteReadyOptions = {}): Promise<Response> {
    return this.page.waitForResponse(
      (response) => response.url().includes(SKM_CONFIG_PATH) && response.request().method() === 'GET',
      { timeout },
    );
  }

  private field(label: string): Locator {
    return this.page.getByLabel(label, { exact: true }).and(this.page.locator(':not([role="listbox"])'));
  }

  private fieldRow(label: string): Locator {
    return this.page.locator('main div.track:has(> span[data-state])').filter({ has: this.field(label) });
  }
}
