import 'node-persist';

declare module 'node-persist' {
  interface LocalStorage {
    options: InitOptions;
    initSync(options?: InitOptions): InitOptions;
    _writeQueueInterval?: NodeJS.Timeout;
    _expiredKeysInterval?: NodeJS.Timeout;
    stopWriteQueueInterval(): void;
  }
}
