/// <reference no-default-lib="true" />
/// <reference lib="esnext" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="deno.window" />
/// <reference lib="deno.ns" />
/// <reference types="./src/index.ts" />

declare type Maybe<T extends any> = T | undefined;

declare type Obj<T extends string = string> = Record<string, T>;

declare type URLSearchParamsInit =
  | string
  | string[][]
  | Record<string, string>
  | URLSearchParams;

declare type ParamObject = Record<string, string>;

declare type ParamsInit = URLSearchParamsInit;
