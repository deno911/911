import { ansi } from "./fmt.ts";

export enum LogLevel {
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

export class Logger {
  #level: LogLevel = LogLevel.Info;

  readonly #labels = {
    debug: "DEBUG",
    info: "INFO",
    log: "LOG",
    warn: "WARN",
    error: "ERROR",
    fatal: "FATAL",
  };

  constructor(level?: LogLevel | LogLevelName) {
    if (level) {
      this.level = level;
    }
    return this;
  }

  get level(): LogLevel {
    return this.#level;
  }

  set level(level: LogLevel | LogLevelName) {
    if (typeof level === "string") {
      this.setLevel(level);
    } else {
      this.#level = level;
    }
  }

  setLevel(level: LogLevelName): void {
    switch (level) {
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
    }
  }

  debug(...args: unknown[]): void {
    if (this.#level <= LogLevel.Debug) {
      console.debug(ansi.cyan(this.#labels.debug), ...args);
    }
  }

  log(...args: unknown[]): void {
    console.log(ansi.dim(this.#labels.log), ...args);
  }

  info(...args: unknown[]): void {
    if (this.#level <= LogLevel.Info) {
      console.log(ansi.green(this.#labels.info), ...args);
    }
  }

  warn(...args: unknown[]): void {
    if (this.#level <= LogLevel.Warn) {
      console.warn(ansi.red(this.#labels.warn), ...args);
    }
  }

  error(...args: unknown[]): void {
    if (this.#level <= LogLevel.Error) {
      console.error(ansi.red(this.#labels.error), ...args);
    }
  }

  fatal(...args: unknown[]): void {
    if (this.#level <= LogLevel.Fatal) {
      console.error(ansi.red(ansi.bold(this.#labels.fatal)), ...args);
      Deno.exit(1);
    }
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
