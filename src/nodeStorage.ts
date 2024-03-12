/**
 * This file contains the classes NodeStorageManager and NodeStorage
 *
 * @file nodeStorage.ts
 * @author Luca Liguori
 * @date 2024-02-02
 * @version 1.0.1
 *
 * All rights reserved.
 *
 */

import NodePersist, { LocalStorage, InitOptions } from 'node-persist';
import { rm } from 'fs/promises';
import path from 'path';

export type NodeStorageKey = string;
export type NodeStorageName = string;
export { InitOptions } from 'node-persist';

/**
 * Class responsible for managing multiple node storages.
 */
export class NodeStorageManager {
  private readonly storage: LocalStorage;
  private readonly initOptions: InitOptions;
  private storageNames: NodeStorageName[]=[];

  /**
   * Initializes a new instance of NodeStorageManager with optional initialization options.
   * @param {InitOptions} [initOptions] - Optional initialization options to customize the storage.
   */
  constructor(initOptions?: InitOptions) {
    // Merge initOptions with default initOptions
    this.initOptions = Object.assign({
      dir: path.join(process.cwd(), 'node_storage'),
      logging: false,
    } as InitOptions, initOptions);

    // Create and initialize a new instace of LocalStorage
    this.storage = NodePersist.create(this.initOptions);
    this.storage.initSync(this.initOptions);
    if(this.initOptions.logging===true) {
      console.log(`Storage manager initialized with options ${JSON.stringify(this.initOptions)}`);
    }
    /*
		this.get<Array<NodeStorageName>>('storageNames').then(storageNames => {
			this.storageNames = storageNames;
		});
		*/
  }

  /**
   * Creates and initializes a new storage with a given name.
   * @param {string} storageName - The name of the new storage to create.
   * @returns {Promise<NodeStorage>} A promise that resolves to the newly created NodeStorage instance.
   */
  async createStorage(storageName: string): Promise<NodeStorage> {
    const initOptions: InitOptions = {};
    Object.assign(initOptions, this.initOptions, { dir: path.join(this.initOptions.dir!, '.' + storageName) } as InitOptions);
    const storage = NodePersist.create(initOptions);
    await storage.init(initOptions);
    //console.log(`Created storage ${storageName} with options ${JSON.stringify(initOptions)}`);

    // Update storageNames
    this.storageNames=await this.storage.get('storageNames') ?? [];
    //console.log('Storage list(1):', this.storageNames);
    if(!this.storageNames.includes(storageName)) {
      this.storageNames.push(storageName);
    }
    //console.log('Storage list(2):', this.storageNames);
    await this.storage.set('storageNames', this.storageNames);
    //console.log('Storage list(3):', await this.storage.get('storageNames') );

    return new NodeStorage(storage, initOptions);
  }

  /**
   * Removes a storage by its name.
   * @param {string} storageName - The name of the storage to remove.
   * @returns {Promise<boolean>} A promise that resolves to true if the storage was successfully removed, otherwise false.
   */
  async removeStorage(storageName: string): Promise<boolean> {
    const dir = path.join(this.initOptions.dir!, '.' + storageName);
    try {
      await rm(dir, { recursive: true });
      //console.log('Storage removed');

      // Update storageNames
      this.storageNames=await this.storage.get('storageNames') ?? [];
      const index = this.storageNames.indexOf(storageName);
      if (index > -1) {
        this.storageNames.splice(index, 1);
      }
      await this.storage.set('storageNames', this.storageNames);
      //console.log('Storage list:', await this.storage.get('storageNames') );

      return true;
    } catch (err) {
      //console.error('Error removing storage:', err);
      return false;
    }
  }

  /**
   * Retrieves the names of all available storages.
   * @returns {Promise<NodeStorageName[]>} A promise that resolves to an array of storage names.
   */
  async getStorageNames(): Promise<NodeStorageName[]> {
    this.storageNames=await this.storage.get('storageNames') ?? [];
    return this.storageNames;
  }

  /**
   * Logs the names of all managed storages to the console.
   */
  async logStorage() {
    console.log('This NodeStorageManager has these storages:');
    const storageNames: NodeStorageName[] = await this.storage.get('storageNames') ?? [];
    storageNames.forEach( name =>{
      console.log(`- ${name}`);
    });
  }
}

/**
 * Class representing a storage for nodes.
 */
export class NodeStorage {
  private readonly storage: LocalStorage;
  private readonly initOptions: InitOptions;

  /**
   * Creates an instance of NodeStorage.
   * @param {LocalStorage} storage - The local storage instance.
   * @param {InitOptions} initOptions - The initialization options.
   */
  constructor(storage: LocalStorage, initOptions: InitOptions) {
    this.storage = storage;
    this.initOptions = initOptions;
  }

  /**
   * Sets a value for a given key in the storage.
   * @template T - The type of the value to be stored.
   * @param {NodeStorageKey} key - The key under which the value is stored.
   * @param {T} value - The value to store.
   * @returns {Promise<NodePersist.WriteFileResult>} A promise that resolves with the result of writing the file.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async set<T = any>(key: NodeStorageKey, value: T): Promise<NodePersist.WriteFileResult> {
    return await this.storage.setItem(key, value);
  }

  /**
   * Retrieves a value for a given key from the storage.
   * If the key does not exist, returns a default value if provided.
   * @template T - The type of the value to retrieve.
   * @param {NodeStorageKey} key - The key of the value to retrieve.
   * @param {T} [defaultValue] - The default value to return if the key is not found.
   * @returns {Promise<T>} A promise that resolves with the value.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async get<T = any>(key: NodeStorageKey, defaultValue?: T): Promise<T> {
    const value = await this.storage.getItem(key);
    return value!==undefined ? value: defaultValue;
  }

  /**
   * Checks if the storage includes a given key.
   * @param {NodeStorageKey} key - The key to check.
   * @returns {Promise<boolean>} A promise that resolves with true if the key exists, otherwise false.
   */
  async includes(key: NodeStorageKey): Promise<boolean> {
    const keys = await this.storage.keys();
    return keys.includes(key);
  }

  /**
   * Removes a value for a given key from the storage.
   * @param {NodeStorageKey} key - The key of the value to remove.
   * @returns {Promise<NodePersist.DeleteFileResult>} A promise that resolves with the result of deleting the file.
   */
  async remove(key: NodeStorageKey): Promise<NodePersist.DeleteFileResult> {
    return await this.storage.removeItem(key);
  }

  /**
   * Clears all entries from the storage.
   * @returns {Promise<void>} A promise that resolves when the storage is cleared.
   */
  async clear(): Promise<void> {
    return await this.storage.clear();
  }

  /**
   * Logs the current storage state to the console.
   */
  async logStorage() {
    console.log(`This NodeStorage has ${await this.storage.length()} keys:`);
    const keys = await this.storage.keys();
    keys.forEach(async key =>{
      console.log(`- ${key}: ${await this.storage.get(key)}`);
    });
  }
}
