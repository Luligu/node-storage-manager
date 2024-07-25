/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import { NodeStorageManager, NodeStorage } from './nodeStorage';
import NodePersist from 'node-persist';
import { jest } from '@jest/globals';

interface DatumTest {
  key: string;

  value: any;
  ttl?: number;
}

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

  it('not existing key should return the default', async () => {
    const returnItem = await storage.get<number>('noKey', 999);
    expect(typeof returnItem).toEqual('number');
    expect(returnItem).toEqual(999);
  });

  it('not existing key should return false', async () => {
    expect(await storage.includes('noKey')).toEqual(false);
  });

  it('existing key should return true', async () => {
    await storage.set<number>('existKey', 9876543210);
    expect(await storage.includes('existKey')).toEqual(true);
    await storage.remove('existKey');
    expect(await storage.includes('existKey')).toEqual(false);
  });

  it('should return a number', async () => {
    const item = 0.2345521;
    await storage.set<number>('numberKey', item);
    const returnItem = await storage.get<number>('numberKey', 999);
    expect(typeof returnItem).toEqual('number');
    expect(item).toEqual(returnItem);
  });

  it('should return a string', async () => {
    const item = '0.2345521';
    await storage.set<string>('stringKey', item);
    const returnItem = await storage.get<string>('stringKey', '999');
    expect(typeof returnItem).toEqual('string');
    expect(item).toEqual(returnItem);
  });

  it('should return a boolean', async () => {
    const item = true;
    await storage.set<boolean>('booleanKey', item);
    const returnItem = await storage.get<boolean>('booleanKey', false);
    expect(typeof returnItem).toEqual('boolean');
    expect(item).toEqual(returnItem);
  });

  it('should return undefined', async () => {
    const item = undefined;
    await storage.set('undefinedKey', item);
    const returnItem = await storage.get('undefinedKey');
    expect(typeof returnItem).toEqual('undefined');
    expect(returnItem).toEqual(item);
  });

  it('should return null', async () => {
    const item = null;
    await storage.set('nullKey', item);
    const returnItem = await storage.get('nullKey');
    expect(returnItem).toEqual(item);
  });

  it('should return string array', async () => {
    const item = ['abc', 'def', 'ghj'];
    await storage.set('stringArrayKey', item);
    const returnItem = await storage.get('stringArrayKey', '1234345');
    console.log('string[]:', returnItem);
    expect(returnItem).toEqual(item);
    expect(typeof returnItem).toEqual('object');
  });

  it('should return string array of 1', async () => {
    const item = ['abc'];
    await storage.set('stringArrayKey', item);
    const returnItem = await storage.get('stringArrayKey', '1234345');
    console.log('string1[]:', returnItem);
    expect(returnItem).toEqual(item);
    expect(typeof returnItem).toEqual('object');
  });

  it('should return empty string array', async () => {
    const item: string[] = [];
    await storage.set('stringArrayKey', item);
    const returnItem = await storage.get('stringArrayKey', '1234345');
    console.log('string[]=[]:', returnItem);
    expect(returnItem).toEqual(item);
    expect(typeof returnItem).toEqual('object');
  });

  it('should return an object', async () => {
    const item = { abc: 'abc', n123: 234, undef: undefined, nil: null };
    await storage.set<object>('objectKey', item);
    const returnItem = await storage.get<object>('objectKey');
    console.log('object:', JSON.stringify(returnItem));
    expect(returnItem).toEqual(item);
    expect(typeof returnItem).toEqual('object');
  });

  it('should return an interface', async () => {
    const item: DatumTest = { key: 'abc', value: 234 };
    await storage.set<DatumTest>('objectKey', item);
    const returnItem = await storage.get<DatumTest>('objectKey');
    console.log('object:', JSON.stringify(returnItem));
    expect(returnItem).toEqual(item);
    expect(typeof returnItem).toEqual('object');
    expect(typeof returnItem).toEqual(typeof item);
  });

  it('should write and read 100 keys correctly', async () => {
    const writePromises: Promise<NodePersist.WriteFileResult>[] = [];
    for (let i = 0; i < 100; i++) {
      const key = `Key${i.toString().padStart(3, '0')}`; // Generates Key000, Key001, ..., Key099
      const value = `Value${i}`;
      writePromises.push(storage.set(key, value));
    }

    // Wait for all write operations to complete
    await Promise.all(writePromises);

    // Now, read back the values to ensure they were written correctly
    const readPromises: Promise<void>[] = [];
    for (let i = 0; i < 100; i++) {
      const key = `Key${i.toString().padStart(3, '0')}`;
      readPromises.push(storage.get(key));
    }

    const values = await Promise.all(readPromises);
    // Verify each value is as expected
    values.forEach((value, index) => {
      expect(value).toEqual(`Value${index}`);
    });
  });
});
