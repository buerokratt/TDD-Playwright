import { EnvUrls } from '@utils/interfaces';

type EnvName = 'test' | 'stage';

const env = process.env.ENV || 'test';

const baseURLs: Record<EnvName, EnvUrls> = {
  test: {
    customer: 'https://test.buerokratt.ee/',
    admin: 'https://admin.test.buerokratt.ee/',
  },
  stage: {
    customer: 'https://stage.buerokratt.ee/',
    admin: 'https://admin.stage.buerokratt.ee/',
  },
};

const isSupportedEnv = (value: string): value is EnvName => value in baseURLs;

export const URLS = isSupportedEnv(env) ? baseURLs[env] : baseURLs.test;
