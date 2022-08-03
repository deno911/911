import { colors } from "../deps.ts";

const { dim, green, red, yellow } = colors;

export class Timing {
  #t = performance.now();

  reset() {
    this.#t = performance.now();
  }

  stop(message: string) {
    const now = performance.now();
    const d = Math.round(now - this.#t);
    let cf = green;
    if (d > 10000) {
      cf = red;
    } else if (d > 1000) {
      cf = yellow;
    }
    console.debug(dim("TIMING"), message, "in", cf(d + "ms"));
    this.#t = now;
  }
}

export class Logger {
  #level: LogLevel = LogLevel.Info;

  get level(): LogLevel {
    return this.#level;
  }

  setLevel(level: LogLevelName): void {
    switch (level) {
      case "debug":
        this.#level = LogLevel.Debug;
        break;
      case "info":
        this.#level = LogLevel.Info;
        break;
      case "warn":
        this.#level = LogLevel.Warn;
        break;
      case "error":
        this.#level = LogLevel.Error;
        break;
      case "fatal":
        this.#level = LogLevel.Fatal;
        break;
    }
  }

  debug(...args: unknown[]): void {
    if (this.#level <= LogLevel.Debug) {
      console.debug(dim("DEBUG"), ...args);
    }
  }

  info(...args: unknown[]): void {
    if (this.#level <= LogLevel.Info) {
      console.log(green("INFO"), ...args);
    }
  }

  warn(...args: unknown[]): void {
    if (this.#level <= LogLevel.Warn) {
      console.warn(yellow("WARN"), ...args);
    }
  }

  error(...args: unknown[]): void {
    if (this.#level <= LogLevel.Error) {
      console.error(red("ERROR"), ...args);
    }
  }

  fatal(...args: unknown[]): void {
    if (this.#level <= LogLevel.Fatal) {
      console.error(red("FATAL"), ...args);
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

export default new Logger();
