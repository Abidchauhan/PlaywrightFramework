// @ts-check

/**
 * Frontend and backend base URLs, overridable via environment variables.
 * Trailing slashes are stripped so callers can always append "/path".
 */
const stripTrailingSlash = (/** @type {string} */ url) => url.replace(/\/+$/, '');

export const BASE_URL = stripTrailingSlash(process.env.BASE_URL || 'http://localhost:5173');
export const API_URL = stripTrailingSlash(process.env.API_URL || 'http://localhost:5000');
