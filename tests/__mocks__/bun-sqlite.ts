export class Database {
  constructor(_path: string, _options?: unknown) {}

  query<T = unknown>(_sql: string) {
    return {
      all: (..._args: unknown[]): T[] => [],
      get: (..._args: unknown[]): T | undefined => undefined,
    };
  }

  run(_sql: string, _params?: unknown): void {}
}
