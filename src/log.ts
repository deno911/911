import { ansi, cases } from "./fmt.ts";
import { is } from "./type.ts";
import { deeperMerge } from "./collection.ts";

export enum LogLevel {
  Log = -1,
  Debug,
  Info,
  Warn,
  Error,
  Fatal,
}

export declare type LogLevelName =
  | Lowercase<keyof typeof LogLevel>
  | Capitalize<Lowercase<keyof typeof LogLevel>>
  | Uppercase<keyof typeof LogLevel>;

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

type LogColors = Exclude<
  keyof typeof ansi,
  | `${string}ColorEnabled`
  | "stripColor"
  | "reset"
  | "rgb8"
  | "rgb24"
  | `bg${string}`
>;

interface LoggerOptions {
  /**
   * The minimum log level to log. Any incoming messages at a lower level will
   * be silently ignored. For example, for level `Error` (3), only `error` and
   * `fatal` messages will be logged (and `Debug`, `Warn`, `Info` are ignored).
   * @default LogLevel.Info (1)
   */
  level?: LogLevel | LogLevelName;
  /**
   * Enable or disable the Timing feature for this Logger instance.
   * @see {@link Timing} for more details.
   * @default false (disabled)
   */
  timing?: boolean;
  /**
   * When enabled, each message logged to the output stream will be prefixed
   * with a label indicating the log level (i.e. `INFO` or `ERROR`). Set to
   * `false` to disable this feature, or provide an object of log level names
   * for keys and your desired labels for values.
   */
  labels?: false | { [key in keyof typeof LogLevel]: string };
  /**
   * Set to false to disable color output, or pass an object with log level
   * names as keys and color names as values to customize the colors.
   */
  colors?: false | { [key in keyof typeof LogLevel]: LogColors };
  /**
   * When enabled, each message logged to the output stream will be prefixed
   * with a timestamp in ISO 8601 format (i.e. `2020-01-01T00:00:00.000Z`).
   * @default true (enabled)
   */
  timestamp?: boolean;
  /**
   * When set to `false`, forcibly disables `color`, `label`, and `newline`
   * (even if they were otherwise enabled individually).
   * @default true (enabled)
   */
  pretty?: boolean;
  /**
   * When enabled, each message logged to the output stream will be prefixed
   * with a newline character (`\n`, [or `\r\n` for Windows]).
   * @default false (disabled)
   */
  newline?: boolean;
}

export class Logger {
  #level: LogLevel = LogLevel.Info;

  static readonly #defaults: LoggerOptions = {
    level: LogLevel.Info,
    timing: false,
    timestamp: true,
    pretty: true,
    newline: true,
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

  private readonly options: LoggerOptions = Logger.#defaults;

  constructor(level?: LogLevel | LogLevelName);
  constructor(options: LoggerOptions);
  constructor(
    levelOrOptions: LoggerOptions | LogLevel | LogLevelName = Logger.#defaults,
  ) {
    type Options = { [K in string & keyof LoggerOptions]?: LoggerOptions[K] };
    if (is.plainObject<LoggerOptions>(levelOrOptions)) {
      this.options = deeperMerge<Options>(
        this.options,
        levelOrOptions as LoggerOptions,
      );
    } else if ((levelOrOptions as any) in LogLevel) {
      this.options = deeperMerge<Options>(this.options, {
        level: (levelOrOptions as LogLevel),
      });
    } else if (is.nullOrUndefined(levelOrOptions)) {
      this.options = Logger.#defaults;
    }
    this.setLevel(this.options.level);
    return this;
  }

  get level(): LogLevel {
    return this.#level;
  }

  set level(level: LogLevel | LogLevelName) {
    if (level in LogLevel) {
      this.#level = LogLevel[level];
    } else if (typeof level === "string") {
      this.#level =
        LogLevel[cases.title(level as string) as keyof typeof LogLevel];
    } else {
      this.#level = LogLevel[Logger.#defaults.level];
    }
  }

  setLevel(level: LogLevel | LogLevelName): void {
    if (level in LogLevel) {
      this.level = LogLevel[level];
    } else {
      switch (cases.lower(level as string)) {
        case "debug":
          this.level = LogLevel.Debug;
          break;
        case "info":
          this.level = LogLevel.Info;
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
          this.level = Logger.#defaults.level;
          break;
      }
    }
  }

  debug(...args: unknown[]): void {
    if (this.#level <= LogLevel.Debug) {
      this.#print("Debug", ...args);
    }
  }

  log(...args: unknown[]): void {
    this.#print("Log", ...args);
  }

  info(...args: unknown[]): void {
    if (this.#level <= LogLevel.Info) {
      this.#print("Info", ...args);
    }
  }

  warn(...args: unknown[]): void {
    if (this.#level <= LogLevel.Warn) {
      this.#print("Warn", ...args);
    }
  }

  error(...args: unknown[]): void {
    if (this.#level <= LogLevel.Error) {
      this.#print("Error", ...args);
    }
  }

  fatal(...args: unknown[]): void {
    if (this.#level <= LogLevel.Fatal) {
      this.#print("Fatal", ...args);
      Deno.exit(1);
    }
  }

  #print(
    level: keyof typeof LogLevel,
    ...args: unknown[]
  ): void {
    if (this.options.timestamp) {
      const timestamp = new Date().toISOString();
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
    const type = level === "Fatal" ? "error" : cases.lower(level);
    console[type](...args);
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

export const log = new Logger();
