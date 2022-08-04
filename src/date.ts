import { log } from "./log.ts";

export {
  dayOfYear,
  difference,
  type DifferenceFormat,
  type DifferenceOptions,
  format,
  isLeap,
  parse,
  toIMF,
  type Unit,
  weekOfYear,
} from "std/datetime/mod.ts";

/**
 * @param value number to format to a relative string
 * @param unit relative units of time (e.g. `"days"`, `"hours"`, etc.)
 * @param options configure the behavior of the time formatting API
 * @returns
 */
export function relativeTime(
  value: number,
  unit: Intl.RelativeTimeFormatUnit,
  {
    style = "long",
    numeric = "auto",
    locales = "en",
    localeMatcher = "best fit",
  }: Intl.RelativeTimeFormatOptions & { locales?: string | string[] } = {},
): string {
  try {
    return new Intl.RelativeTimeFormat(locales, {
      style,
      numeric,
      localeMatcher,
    }).format(value, unit);
  } catch (e) {
    log.error(e);
    return "";
  }
}

/**
 * Maps human-readable time measurement names to their numeric values.
 * (in scientific notation)
 * @enum TimePortalUnits
 */
export enum TimeUnits {
  millisecond = 1e-3 * second,
  microsecond = 1e-6 * second,
  nanosecond = 1e-9 * second,
  /**
   * set to 1 to scale everything down to seconds. 
   * leave as 1e3 to scale everything as milliseconds.
   */
  second = 1e3,
  minute = 60 * second,
  hour = 3.6e3 * second,
  day = 8.64e4 * second,
  week = 6.048e5 * second,
  month = 2.628e6 * second,
  year = 3.1536e7 * second,

  millis = millisecond,
  nanos = nanosecond,
  micros = microsecond,
  sec = second,
  min = minute,
  hr = hour,
  wk = week,
  mo = month,
  yr = year,
  ms = millisecond,
  ns = nanosecond,
  us = microsecond,
  s = second,
  m = minute,
  h = hour,
  d = day,
  w = week,
  M = month,
  Y = year,
}

/**
 * 1/1000th of a second is... 1 millisecond. 1e-3;
 */
export const MILLISECOND = TimeUnits.ms;

/**
 * 1 billionth of a second: 1 nanosecond. 1e-9;
 */
export const NANOSECOND = TimeUnits.ns;

/**
 * 1 millionth of a second: 1 microsecond. 1e-6;
 */
export const MICROSECOND = TimeUnits.us;

/**
 * 1 second
 */
export const SECOND = TimeUnits.second;

/**
 * 1 minute
 */
export const MINUTE = TimeUnits.minute;

/**
 * 1 hour
 */
export const HOUR = TimeUnits.hour;

/**
 * 1 day
 */
export const DAY = TimeUnits.day;

/**
 * 1 week
 */
export const WEEK = TimeUnits.week;

/**
 * 1 month; 1/12th of a year; just over 30 days.
 */
export const MONTH = TimeUnits.month;

/**
 * 1/4 of a year (3 months).
 */
export const QUARTER = TimeUnits.year / 4;

/**
 * 1 year of seconds (or milliseconds).
 */
export const YEAR = TimeUnits.year;

/**
 * 10 years in seconds.
 */
export const DECADE = TimeUnits.year * 10;

/**
 * 100 years in seconds.
 */
export const CENTURY = TimeUnits.year * 100;


// shorthand aliases
export {
  DAY as DY,
  HOUR as HR,
  MICROSECOND as US,
  MILLISECOND as MS,
  MINUTE as MIN,
  MONTH as MO,
  NANOSECOND as NS,
  QUARTER as QR,
  SECOND as SEC,
  WEEK as WK,
  YEAR as YR,
};
