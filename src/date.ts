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
 * Maps human-readable time measurement names to their numeric values.
 * (in scientific notation)
 * @enum TimePortalUnits
 */
export enum TimeUnits {
  /** 1 millisecond */
  millisecond = 1e-3 * TimeUnits.second,
  /** 1 millisecond */
  microsecond = 1e-6 * TimeUnits.second,
  /** 1 nanosecond */
  nanosecond = 1e-9 * TimeUnits.second,
  /** 1 second */
  second = 1e3,
  /** 1 minute */
  minute = 60 * TimeUnits.second,
  /** 1 hour */
  hour = 3.6e3 * TimeUnits.second,
  /** 1 day */
  day = 8.64e4 * TimeUnits.second,
  /** 1 week */
  week = 6.048e5 * TimeUnits.second,
  /** 1 month */
  month = 2.628e6 * TimeUnits.second,
  /** 1 year */
  year = 3.1536e7 * TimeUnits.second,
  /** millisecond */
  millis = millisecond,
  /** nanosecond */
  nanos = nanosecond,
  /** microsecond */
  micros = microsecond,
  /** second */
  sec = second,
  /** minute */
  min = minute,
  /** hour */
  hr = hour,
  /** week */
  wk = week,
  /** month */
  mo = month,
  /** year */
  yr = year,
  /** millisecond */
  ms = millisecond,
  /** nanosecond */
  ns = nanosecond,
  /** microsecond */
  us = microsecond,
  /** second */
  s = second,
  /** minute */
  m = minute,
  /** hour */
  h = hour,
  /** day */
  d = day,
  /** week */
  w = week,
  /** month */
  M = month,
  /** year */
  Y = year,
}

export const SECOND = TimeUnits.second;

/**
 * 1 year of seconds (or milliseconds).
 */
export const YEAR = TimeUnits.year;

/**
 * 1/4 of a year (3 months).
 */
export const QUARTER = TimeUnits.year / 4;

/**
 * 1 month; 1/12th of a year; just over 30 days.
 */
export const MONTH = TimeUnits.month;

/**
 * 10 years in seconds.
 */
export const DECADE = TimeUnits.year * 10;

/**
 * 100 years in seconds.
 */
export const CENTURY = TimeUnits.year * 100;

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
