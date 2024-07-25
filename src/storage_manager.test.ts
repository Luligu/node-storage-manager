/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { NodeStorageManager, NodeStorage } from './nodeStorage';
import { jest } from '@jest/globals';

describe('NodeStorageManager with NodeStorage', () => {
  let consoleLogSpy: jest.SpiedFunction<typeof console.log>;
  let storageManager: NodeStorageManager;
  let storage: NodeStorage;

  beforeAll(async () => {
    // Spy on and mock console.log
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation((...args: any[]) => {
      // Mock implementation or empty function
    });
    storageManager = new NodeStorageManager();
    storage = await storageManager.createStorage('testStorage');
  });

  it('should return the number of the storages created', async () => {
    const keys = await storageManager.getStorageNames();
    // console.log('getStorageNames()', keys);
    expect(keys?.length).toEqual(1);
  });

  it('should return the name of the storage created', async () => {
    const keys = await storageManager.getStorageNames();
    // console.log('getStorageNames()', keys);
    expect(keys).toEqual(['testStorage']);
  });

  it('should return the number of storages created', async () => {
    await storageManager.createStorage('testStorage 2');
    await storageManager.createStorage('testStorage 3');
    const keys = await storageManager.getStorageNames();
    expect(keys).toEqual(['testStorage', 'testStorage 2', 'testStorage 3']);
    expect(keys?.length).toEqual(3);
  });

  it('should log the storageManager names', async () => {
    const size = await storageManager.logStorage();
    expect(size).toEqual(1);
  });

  it('should log the storage keys', async () => {
    const size = await storage.logStorage();
    expect(size).toEqual(107);
  });

  it('should return the names of storages created', async () => {
    let keys = await storageManager.getStorageNames();
    const expectedNames = ['testStorage', 'testStorage 2', 'testStorage 3'];
    expect(keys).toEqual(expectedNames);

    await storageManager.removeStorage('testStorage 2');
    keys = await storageManager.getStorageNames();
    expect(keys).toEqual(['testStorage', 'testStorage 3']);

    await storageManager.removeStorage('testStorage 3');
    keys = await storageManager.getStorageNames();
    expect(keys).toEqual(['testStorage']);
  });

  it('should not start writeInterval with writeQueue = false', async () => {
    const customOptions = { dir: 'custom_dir', writeQueue: false, expiredInterval: undefined };
    storageManager = new NodeStorageManager(customOptions);
    storage = await storageManager.createStorage('testStorage');
    // console.log('storageManager.options:', (storageManager as any).storage.options);
    // console.log('storage.options:', (storage as any).storage.options);

    /*
    console.log('storageManager:', storageManager);
    console.log('storage:', storage);
    console.log('storage:', (storage as any).storage);
    console.log('storage:', (storage as any).storage._expiredKeysInterval);
    console.log('storage:', (storage as any).storage._writeQueueInterval);
    */
    // expect((storageManager as any).storage._writeQueueInterval).toBe(undefined);
    expect((storageManager as any).storage._expiredKeysInterval).toBeUndefined();
    expect((storageManager as any).storage._writeQueueInterval).toBeUndefined();
    expect((storage as any).storage._expiredKeysInterval).toBeUndefined();
    expect((storage as any).storage._writeQueueInterval).toBeUndefined();

    await storage.set('key', 'Abc');
    expect(await (storage as any).storage.length()).toEqual(1);
    await storage.clear();
    expect(await (storage as any).storage.length()).toEqual(0);

    storage.close();
    storageManager.close();
  });
});
