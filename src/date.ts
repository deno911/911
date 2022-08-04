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
  /** 1 nanosecond */
  nanosecond = 1e-6,
  /** 1 millisecond */
  millisecond = 1e-3,
  /** 1 second */
  second = 1,
  /** 1 minute */
  minute = 60,
  /** 1 hour */
  hour = 3.6e3,
  /** 1 day */
  day = 8.64e4,
  /** 1 week */
  week = 6.048e5,
  /** 1 month */
  month = 2.628e6,
  /** 1 year */
  year = 3.1536e7,
  /** nanosecond */
  nanos = nanosecond,
  /** millisecond */
  millis = millisecond,
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
  /** nanosecond */
  ns = nanosecond,
  /** millisecond */
  ms = millisecond,
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
