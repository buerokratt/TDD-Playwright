import { Locator } from '@playwright/test';

export interface CopyToDomainOptions {
  readonly button: Locator;
  readonly transferPath: string;
}
