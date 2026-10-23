import { URLS } from '@utils/env';

const BACKOFFICE_V2_BASE = `${URLS.api}v2/private/backoffice`;

// ACCOUNTS

export const CSA_ACTIVITY_PATH = 'accounts/customer-support-activity';
export const CSA_ACTIVITY_URL = `${BACKOFFICE_V2_BASE}/${CSA_ACTIVITY_PATH}`;

export const WIDGET_DATA_URL = `${BACKOFFICE_V2_BASE}/accounts/widget-data`;

// CONFIGS

export const CHAT_ANALYSIS_URL = `${BACKOFFICE_V2_BASE}/configs/chat-analysis`;

export const ORGANIZATION_WORKING_TIME_URL = `${BACKOFFICE_V2_BASE}/configs/organization-working-time`;

export const ANONYMIZER_CONFIG_PATH = 'configs/anonymizer';
export const ANONYMIZER_TRANSFER_PATH = 'configs/transfer/anonymizer';

export const WIDGET_DOMAINS_PATH = 'configs/widget-domains';
export const WIDGET_DOMAINS_URL = `${BACKOFFICE_V2_BASE}/${WIDGET_DOMAINS_PATH}`;

// AGENTS, CHATS

export const ENDED_CHATS_PATH = 'agents/chats/ended';

export const CHAT_MEASUREMENTS_PATH = 'chats/quality/measurements';

// AUTH

export const USER_INFO_URL = `${BACKOFFICE_V2_BASE}/auth/jwt/userinfo`;
