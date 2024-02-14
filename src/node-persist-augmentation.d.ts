import 'node-persist';

declare module 'node-persist' {
  interface LocalStorage {
    initSync(options?: InitOptions): InitOptions;
  }
}
