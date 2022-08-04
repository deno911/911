import { DAY, HOUR, MINUTE, SECOND, WEEK } from "std/datetime/mod.ts";

/**
 * Initial value for the `inMemoryCache` constructor.
 */
export const CACHE_CAPACITY = 20;

/**
 * 1 year of seconds (or milliseconds).
 */
export const YEAR = DAY * 365.25;

/**
 * 1/4 of a year (3 months).
 */
export const QUARTER = YEAR / 4;

/**
 * 1 month; 1/12th of a year; just over 30 days.
 */
export const MONTH = YEAR / 12;

/**
 * 10 years in seconds.
 */
export const DECADE = YEAR * 10;

/**
 * 100 years in seconds.
 */
export const CENTURY = YEAR * 1e2;

/**
 * 1/1000th of a second is... 1 millisecond.
 */
export const MILLISECOND = SECOND / 1e3;

/**
 * 1 millionth of a second: 1 nanosecond.
 */
export const NANOSECOND = SECOND / 1e6;

/**
 * 1 billionth of a second: 1 microsecond.
 */
export const MICROSECOND = SECOND / 1e9;

export {
  DAY,
  DAY as DY,
  HOUR,
  HOUR as HR,
  MICROSECOND as US,
  MILLISECOND as MS,
  MINUTE,
  MINUTE as MIN,
  MONTH as MO,
  NANOSECOND as NS,
  QUARTER as QR,
  SECOND,
  SECOND as SEC,
  WEEK,
  WEEK as WK,
  YEAR as YR,
};
