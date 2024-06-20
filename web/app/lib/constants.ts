
/**
 * @param {Date} NULLDATE Object we can use for NULL but also instanceof Date().
 */
export const NULLDATE = new Date('1970-01-01T00:00:00');

/**
 * @param {number} CACHE_EXPIRY_SECONDS Number of seconds before client-store cache expires.
 */
export const CACHE_EXPIRY_SECONDS = 120;

/**
 * @param {number} DEFAULT_DATERANGE Number of ms in the default date range. (90 days)
 */
export const DEFAULT_DATERANGE = 90 * 24 * 60 * 60 * 1000;

