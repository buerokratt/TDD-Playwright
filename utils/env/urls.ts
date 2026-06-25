type EnvUrls = { customer: string; admin: string };
type EnvName = 'test' | 'stage';

export const env: string = process.env.ENV ?? 'test';

export const baseURLs: Record<EnvName, EnvUrls> = {
  test: {
    customer: 'https://test.buerokratt.ee/',
    admin: 'https://admin.test.buerokratt.ee/',
  },
  stage: {
    customer: 'https://stage.buerokratt.ee/',
    admin: 'https://admin.stage.buerokratt.ee/',
  },
};

export const URLS: EnvUrls = baseURLs[env as EnvName] ?? baseURLs.test;
