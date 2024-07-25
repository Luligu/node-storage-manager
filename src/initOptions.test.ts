/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { jest } from '@jest/globals';
import { NodeStorageManager } from './nodeStorage';
import NodePersist, { LocalStorage } from 'node-persist';
import path from 'path';
import fsPromises from 'fs/promises';

// Mock node-persist module
jest.spyOn(NodePersist, 'create').mockImplementation((options) => {
  return {
    initSync: jest.fn(),
    options,
  } as unknown as LocalStorage;
});

// Mock path module
jest.spyOn(path, 'join').mockImplementation((...args) => args.join('/'));

// Mock fs/promises module
jest.spyOn(fsPromises, 'rm').mockResolvedValue(undefined);

describe('NodeStorageManager', () => {
  const defaultDir = process.cwd() + '/node_storage';
  let consoleLogSpy: jest.SpiedFunction<typeof console.log>;

  beforeAll(() => {
    // Spy on and mock console.log
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation((...args: any[]) => {
      // Mock implementation or empty function
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create and initialize storage with default options', async () => {
    new NodeStorageManager();
    expect(NodePersist.create).toHaveBeenCalledWith({
      dir: defaultDir,
      logging: false,
      writeQueue: false,
      expiredInterval: undefined,
    });
  });

  it('should merge custom init options with defaults', async () => {
    const customOptions = { dir: 'custom_dir', logging: true };
    const expectedOptions = {
      dir: 'custom_dir',
      logging: true,
      writeQueue: false,
      expiredInterval: undefined,
    };
    new NodeStorageManager(customOptions);
    expect(NodePersist.create).toHaveBeenCalledWith(expectedOptions);
  });
});
