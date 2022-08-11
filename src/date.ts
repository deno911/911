import { log } from "./log.ts";
import { is } from "./type.ts";
import {
  difference as date_difference,
  type DifferenceFormat,
  type DifferenceOptions,
  format as format_date,
  parse as parse_date,
  type Unit as DiffUnit,
} from "../deps.ts";

export { dayOfYear, isLeap, toIMF, type Unit, weekOfYear } from "../deps.ts";

export type { DifferenceFormat, DifferenceOptions };

/**
 * Default date format string, used by `.parse()` and `.format()`.
 * @see {@link parse}
 * @see {@link format}
 */
export const defaultFormatString = "yyyy-MM-dd";

/**
 * Attempts to parse a date/time value from a `string`, using `formatString`
 * as a format to enforce. Returns a `Date` instance.
 * @param date - `string` to parse into a new `Date` instance
 * @param formatString - format string to enforce (e.g. `yyyy-MM-dd`)
 * @returns a new `Date` instance
 * @example ```ts
 * import { parse } from "./date.ts";
 *
 * parse("2019-01-01", "yyyy-MM-dd");
 * // => Date { 2019-01-01T00:00:00.000Z }
 * ```
 */
export function parse(
  date: string | number,
  formatString = defaultFormatString,
): Date {
  date = is.string(date) ? date : new Date(date).toISOString();
  return parse_date(date, formatString);
}

/**
 * Format a date from either a `string` (datestamp or timestamp), a `number`
 * (milliseconds since epoch), or existing `Date` instance. Returns a string
 * according to the provided format string.
 * @param date - `string`, `number`, or `Date` instance
 * @param formatString - valid format string, e.g. `yyyy-MM-dd`
 * @returns formatted date string
 */
export const format = (
  date: Date | string | number,
  formatString = defaultFormatString,
) => {
  date = (typeof date === "string") ? parse(date) : new Date(date);
  return format_date(date as Date, formatString);
};

/**
 * Calculate the difference between two dates.
 *
 * @param from
 * @param to
 * @param units
 */
export function difference(
  from: number | string | Date,
  to: number | string | Date,
  units?: DiffUnit,
): number;

/**
 * Calculate the difference between two dates.
 * @param from - date to start from
 * @param to - date to end at
 * @param options.units - units to calculate the difference in.
 * @returns difference in the specified units
 */
export function difference(
  from: number | string | Date,
  to: number | string | Date,
  options?: DifferenceOptions,
): Partial<DifferenceFormat>;

export function difference(
  from: any,
  to: any,
  options: DiffUnit | DifferenceOptions = {},
) {
  from = is.string(from) ? parse(from) : new Date(from);
  to = is.string(to) ? parse(to) : new Date(to);
  if (is.string(options)) {
    return date_difference(from, to, {
      units: options.split(/\s*[,]\s*/g),
    } as DifferenceOptions)[options];
  }
  return date_difference(from, to, options);
}

export declare interface RelativeTimeOptions
  extends Intl.RelativeTimeFormatOptions {
  locales?: string | string[];
  absolute?: boolean;
  timeZone?: string;
}

/**
 * Formats a relative time string from a numeric value (positive for the future, negative for the past) and a unit of time (e.g. "minutes", "hours").
 * @param value number to format to a relative string
 * @param unit relative units of time (e.g. `"days"`, `"hours"`, etc.)
 * @param options configure the behavior of the time formatting API
 * @example ```ts
 * import { relative } from "./date.ts";
 * relative(1, "days");
 * // "in 1 day"
 * ```
 * @example ```ts
 * import { relative } from "./date.ts";
 * relative(-1, "hours");
 * // "1 hour ago"
 * ```
 */
export function relative(
  value: number,
  unit: RelativeUnit,
  {
    style = "long",
    numeric = "auto",
    locales = "en",
    localeMatcher = "best fit",
  }: RelativeTimeOptions = {},
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
export enum Times {
  /**
   * set to 1 to scale everything down to seconds.
   * leave as 1e3 to scale everything as milliseconds.
   */
  second = 1e3,
  millisecond = 1e-3 * second,
  microsecond = 1e-6 * second,
  nanosecond = 1e-9 * second,
  minute = 60 * second,
  hour = 3.6e3 * second,
  day = 8.64e4 * second,
  week = 6.048e5 * second,
  month = 2.628e6 * second,
  year = 3.1536e7 * second,
}

export type RelativeUnit = `${
  | Exclude<
    keyof typeof Times,
    "millisecond" | "nanosecond" | "microsecond"
  >
  | "quarter"}${"" | "s"}`;

export enum TimesAbbr {
  millis = Times.millisecond,
  nanos = Times.nanosecond,
  micros = Times.microsecond,
  sec = Times.second,
  min = Times.minute,
  hr = Times.hour,
  wk = Times.week,
  mo = Times.month,
  yr = Times.year,
  ms = Times.millisecond,
  ns = Times.nanosecond,
  us = Times.microsecond,
  s = Times.second,
  m = Times.minute,
  h = Times.hour,
  d = Times.day,
  w = Times.week,
  M = Times.month,
  Y = Times.year,
}

/**
 * 1/1000th of a second is... 1 millisecond. 1e-3;
 */
export const MILLISECOND = Times.millisecond;

/**
 * 1 billionth of a second: 1 nanosecond. 1e-9;
 */
export const NANOSECOND = Times.nanosecond;

/**
 * 1 millionth of a second: 1 microsecond. 1e-6;
 */
export const MICROSECOND = Times.microsecond;

/**
 * 1 second
 */
export const SECOND = Times.second;

/**
 * 1 minute
 */
export const MINUTE = Times.minute;

/**
 * 1 hour
 */
export const HOUR = Times.hour;

/**
 * 1 day
 */
export const DAY = Times.day;

/**
 * 1 week
 */
export const WEEK = Times.week;

/**
 * 1 month; 1/12th of a year; just over 30 days.
 */
export const MONTH = Times.month;

/**
 * 1/4 of a year (3 months).
 */
export const QUARTER = Times.year / 4;

/**
 * 1 year of seconds (or milliseconds).
 */
export const YEAR = Times.year;

/**
 * 10 years in seconds.
 */
export const DECADE = Times.year * 10;

/**
 * 100 years in seconds.
 */
export const CENTURY = Times.year * 100;

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
