/// <reference no-default-lib="true" />
/// <reference lib="esnext" />
/// <reference lib="deno.ns" />
/// <reference lib="deno.window" />
/// <reference lib="deno.shared_globals" />

import { ansi, cases } from "./fmt.ts";
import { is } from "./type.ts";
import { deepMerge } from "./collection.ts";

export enum LogLevel {
  Log = -1,
  Debug,
  Info,
  Warn,
  Error,
  Fatal,
}

type ConsoleMethods = "log" | "debug" | "info" | "warn" | "error";

export type Options = Partial<{
  /**
   * The minimum log level to log. Any incoming messages at a lower level will
   * be silently ignored. For example, for level `Error` (3), only `error` and
   * `fatal` messages will be logged (and `Debug`, `Warn`, `Info` are ignored).
   * @default LogLevel.Info (1)
   */
  level: LogLevel | LogLevelName;
  /**
   * Enable or disable the Timing feature for this Logger instance.
   * @see {@link Timing} for more details.
   * @default false (disabled)
   */
  timing: boolean;
  /**
   * When enabled, each message logged to the output stream will be prefixed
   * with a label indicating the log level (i.e. `INFO` or `ERROR`). Set to
   * `false` to disable this feature, or provide an object of log level names
   * for keys and your desired labels for values.
   */
  labels: false | { [key in keyof typeof LogLevel]: string };
  /**
   * Set to false to disable color output, or pass an object with log level
   * names as keys and color names as values to customize the colors.
   */
  colors: false | { [key in keyof typeof LogLevel]: LogColors };
  /**
   * When enabled, each message logged to the output stream will be prefixed
   * with a timestamp in ISO 8601 format (i.e. `2020-01-01T00:00:00.000Z`).
   * @default true (enabled)
   */
  timestamp: boolean;
  /**
   * When set to `false`, forcibly disables `color`, `label`, and `newline`
   * (even if they were otherwise enabled individually).
   * @default true (enabled)
   */
  pretty: boolean;
  /**
   * When enabled, each message logged to the output stream will be prefixed
   * with a newline character (`\n`, [or `\r\n` for Windows]).
   * @default false (disabled)
   */
  newline: boolean;
}>;

export class Timing {
  #t = performance.now();

  reset() {
    this.#t = performance.now();
  }

  stop(message: string) {
    const now = performance.now();
    const d = Math.round(now - this.#t);
    let cf = ansi.green;
    if (d > 10000) {
      cf = ansi.red;
    } else if (d > 1000) {
      cf = ansi.yellow;
    }
    console.debug(ansi.dim("TIMING"), message, "in", cf(d + "ms"));
    this.#t = now;
  }
}

export class Logger {
  #level: LogLevel = LogLevel.Info;

  static readonly #defaults: RequiredOptions = {
    level: LogLevel.Info,
    timing: false,
    timestamp: true,
    pretty: true,
    newline: false,
    colors: {
      Debug: "cyan",
      Info: "green",
      Log: "dim",
      Warn: "yellow",
      Error: "red",
      Fatal: "brightRed",
    },
    labels: {
      Debug: "DEBUG",
      Info: "INFO",
      Log: "LOG",
      Warn: "WARN",
      Error: "ERROR",
      Fatal: "FATAL",
    },
  };

  #options: RequiredOptions = Logger.#defaults;

  set options(options: Options) {
    this.#options = deepMerge(Logger.#defaults, this.#options);
    this.#options = deepMerge(this.#options, options);
  }

  get options(): RequiredOptions {
    return this.#options ?? Logger.#defaults;
  }

  constructor(level?: LogLevel | LogLevelName);
  constructor(options: Options);
  constructor(
    init: Options | LogLevel | LogLevelName = Logger.#defaults,
  ) {
    if (is.plainObject<Options>(init)) {
      this.options = deepMerge<Options>(
        this.options,
        init as Options,
      );
    } else if ((init as any) in LogLevel) {
      this.options = deepMerge<Options>(this.options, {
        level: (init as LogLevel),
      });
    } else if (is.nullOrUndefined(init)) {
      this.options = Logger.#defaults;
    }
    this.setLevel(this.options.level);
    return this;
  }

  get level(): LogLevel {
    return this.#level;
  }

  set level(level: LogLevel) {
    this.#level = level;
  }

  setLevel(level: LogLevel | LogLevelName): void {
    if (level in LogLevel) {
      this.#level = LogLevel[level as keyof typeof LogLevel];
    } else if (is.string(level)) {
      switch (cases.lower(level)) {
        case "debug":
          this.level = LogLevel.Debug;
          break;
        case "info":
          this.level = LogLevel.Info;
          break;
        case "log":
          this.level = LogLevel.Log;
          break;
        case "warn":
          this.level = LogLevel.Warn;
          break;
        case "error":
          this.level = LogLevel.Error;
          break;
        case "fatal":
          this.level = LogLevel.Fatal;
          break;
        default:
          this.setLevel(Logger.#defaults.level);
          break;
      }
    }
  }

  debug(...args: unknown[]): void {
    if (this.#level <= LogLevel.Debug) {
      this.#print("Debug", ...args);
    }
  }

  /**
   * Logs a message to the console or other output stream, regardless of the
   * current log level. **Use with caution!** This method overrides the level
   * feature, and always logs to `stdout`, `console`, or other output stream.
   * @param args the data to print to the log stream
   * @returns void
   * @see {@link LogLevel.Info}
   * @example ```ts
   * import { Logger } from "https://deno.land/x/911@0.1.4/src/log.ts";
   * const logger = new Logger();
   *
   * logger.log("Hello, world!");
   * // LOG 2022-08-19T20:18:41 Hello world!
   * ```
   */
  log(...args: unknown[]): void {
    this.#print("Log", ...args);
  }

  /**
   * If the current log level is less than or equal to `Info`, this will log
   * the provided data to `stdout`, `console`, or other logging stream.
   * @param args the data to print to the log stream
   * @returns void
   * @see {@link LogLevel.Info}
   * @example ```ts
   * import { Logger } from "https://deno.land/x/911@0.1.4/src/log.ts";
   * const logger = new Logger("info");
   * logger.info("Hello, world!");
   * // INFO 2022-08-19T20:18:41 Hello world!
   * ```
   */
  info(...args: unknown[]): void {
    if (this.#level <= LogLevel.Info) {
      this.#print("Info", ...args);
    }
  }

  /**
   * If the current log level is less than or equal to `Warn`, this will log
   * the provided data to `stderr`, `console`, or other logging stream.
   * @param args the data to print to the log stream
   * @returns void
   * @see {@link LogLevel.Warn}
   * @example ```ts
   * import { Logger } from "https://deno.land/x/911@0.1.4/src/log.ts";
   * const logger = new Logger();
   * logger.setLevel("debug");
   *
   * logger.warn("Hello, world!");
   * // WARN 2022-08-19T20:18:41 Hello world!
   *
   * logger.setLevel("error");
   * logger.warn("Hello, world!");
   * // (no output)
   * ```
   */
  warn(...args: unknown[]): void {
    if (this.#level <= LogLevel.Warn) {
      this.#print("Warn", ...args);
    }
  }

  /**
   * If the current log level is less than or equal to `Error`, this will log
   * the provided data to the stderr, console, or other logging stream.
   * @param args the data to print to the log stream
   * @returns void
   * @see {@link LogLevel.Error}
   * @example ```ts
   * import { Logger } from "https://deno.land/x/911@0.1.4/src/log.ts";
   * const logger = new Logger();
   *
   * logger.setLevel("error");
   * logger.error("Hello, world!");
   * // ERROR 2022-08-19T20:18:41 Hello world!
   *
   * logger.setLevel("fatal");
   * logger.error("Hello, world!");
   * // (no output)
   * ```
   */
  error(...args: unknown[]): void {
    if (this.#level <= LogLevel.Error) {
      this.#print("Error", ...args);
    }
  }

  /**
   * Regardless of the current log level, this will log the provided data to
   * `stderr`, `console`, or other logging stream, and then exit the process
   * with a non-zero exit code.
   * @param args the data to print to the log stream
   * @returns void
   * @see {@link LogLevel.Fatal}
   * @example ```ts
   * import { Logger } from "https://deno.land/x/911@0.1.4/src/log.ts";
   * const logger = new Logger();
   *
   * logger.fatal("Hello, world!");
   * // FATAL 2022-08-19T20:18:41 Hello world!
   * // exit code 1
   */
  fatal(...args: unknown[]): void {
    this.#print("Fatal", ...args);
    Deno.exit(1);
  }

  #print(
    level: keyof typeof LogLevel,
    ...args: unknown[]
  ): void {
    if (this.options.timestamp) {
      const timestamp = new Date().toISOString().replace(/\.\d{3}Z$/, "");
      if (this.options.colors && this.options.pretty) {
        args.unshift(ansi.dim(timestamp));
      } else {
        args.unshift(timestamp);
      }
    }
    if (this.options.labels) {
      const label = this.options.labels[level];
      if (this.options.colors && this.options.colors[level]) {
        args.unshift(ansi[this.options.colors[level]](ansi.bold(label)));
      } else {
        args.unshift(label);
      }
    }
    if (this.options.newline) {
      args[0] = "\n" + args[0];
    }
    const m = cases.lower(level).replace("fatal", "error") as ConsoleMethods;
    console[m](...args);
  }

  timing(): {
    reset(): void;
    stop(message?: string): void;
  } {
    if (this.level === LogLevel.Debug) {
      return new Timing();
    }
    return {
      reset: () => {},
      stop: () => {},
    };
  }
}

export declare type LogLevelName =
  | Lowercase<keyof typeof LogLevel>
  | Capitalize<Lowercase<keyof typeof LogLevel>>
  | Uppercase<keyof typeof LogLevel>;

type LogColors = Exclude<
  keyof typeof ansi,
  | `${string}ColorEnabled`
  | "stripColor"
  | "reset"
  | "rgb8"
  | "rgb24"
  | `bg${string}`
>;

export declare type RequiredOptions = Required<Options>;

export const log = new Logger();
