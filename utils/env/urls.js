const env = process.env.ENV || 'test';

const baseURLs = {
  test: {
    customer: 'https://test.buerokratt.ee/',
    admin: 'https://admin.test.buerokratt.ee/',
  },
  stage: {
    customer: 'https://stage.buerokratt.ee/',
    admin: 'https://admin.stage.buerokratt.ee/',
  },
};

const URLS = baseURLs[env] || baseURLs.test;

module.exports = { env, baseURLs, URLS };
