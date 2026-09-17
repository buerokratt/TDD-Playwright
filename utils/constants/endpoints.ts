import { URLS } from '@utils/env';

const BACKOFFICE_V2_BASE = `${URLS.api}v2/private/backoffice`;

/** The back office's own status endpoint: read with GET, written with POST by the header switch. */
export const CSA_ACTIVITY_PATH = 'accounts/customer-support-activity';

export const CSA_ACTIVITY_URL = `${BACKOFFICE_V2_BASE}/${CSA_ACTIVITY_PATH}`;

/** The widgets this account may configure. Asks for the account by `user_id`, answers 500 without it. */
export const WIDGET_DATA_URL = `${BACKOFFICE_V2_BASE}/accounts/widget-data`;

/**
 * Administration -> Office opening hours, where the texts the bot falls back on are edited.
 * Asks for one widget by `domain`, answers 500 without it.
 */
export const ORGANIZATION_WORKING_TIME_URL = `${BACKOFFICE_V2_BASE}/configs/organization-working-time`;

/**
 * Administration -> Chat analysis, where the label sections are edited.
 * GET asks for one domain by `domain`, POST writes the settings back with `domainUuid`.
 */
export const CHAT_ANALYSIS_URL = `${BACKOFFICE_V2_BASE}/configs/chat-analysis`;

/** Who is signed in: answers `displayName`, the name the suite expects on a conversation it analysed. */
export const USER_INFO_URL = `${BACKOFFICE_V2_BASE}/auth/jwt/userinfo`;

/** The quality measurements of a conversation: read with GET when History opens one, written with POST when its analysis is saved. */
export const CHAT_MEASUREMENTS_PATH = 'chats/quality/measurements';
