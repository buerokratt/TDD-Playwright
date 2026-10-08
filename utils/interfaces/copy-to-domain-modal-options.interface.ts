import { Locator } from '@playwright/test';

export interface CopyToDomainModalOptions {
  readonly button: Locator;
  readonly transferPath: string;
}
