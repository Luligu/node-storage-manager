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

export class NodeStorageManager {
	private readonly storage: LocalStorage;
	private readonly initOptions: InitOptions;
	private storageNames: NodeStorageName[]=[];

	constructor(initOptions?: InitOptions) {
		// Merge initOptions with default initOptions
		this.initOptions = Object.assign({
			dir: path.join(process.cwd(), 'node_storage'),
			logging: false,
		} as InitOptions, initOptions);

		// Create and initialize a new instace of LocalStorage
		this.storage = NodePersist.create(this.initOptions);
		this.storage.initSync(this.initOptions);
		console.log(`Storage manager initialized with options ${JSON.stringify(this.initOptions)}`);
		/*
		this.get<Array<NodeStorageName>>('storageNames').then(storageNames => {
			this.storageNames = storageNames;
		});
		*/
	}

	async createStorage(storageName: string): Promise<NodeStorage> {
		const initOptions: InitOptions = {};
		Object.assign(initOptions, this.initOptions, { dir: path.join(this.initOptions.dir!, '.' + storageName) } as InitOptions);
		const storage = NodePersist.create(initOptions);
		await storage.init(initOptions);
		console.log(`Created storage ${storageName} with options ${JSON.stringify(initOptions)}`);

		// Update storageNames
		this.storageNames=await this.storage.get('storageNames') ?? [];
		//console.log('Storage list(1):', this.storageNames);
		if(!this.storageNames.includes(storageName))
			this.storageNames.push(storageName);
		//console.log('Storage list(2):', this.storageNames);
		await this.storage.set('storageNames', this.storageNames);
		//console.log('Storage list(3):', await this.storage.get('storageNames') );

		return new NodeStorage(storage, initOptions);
	}

	async removeStorage(storageName: string): Promise<boolean> {
		const dir = path.join(this.initOptions.dir!, '.' + storageName);
		try {
			await rm(dir, { recursive: true });
			console.log('Storage removed');

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
			console.error('Error removing storage:', err);
			return false;
		}
	}

	async getStorageNames(): Promise<NodeStorageName[]> {
		this.storageNames=await this.storage.get('storageNames') ?? [];
		return this.storageNames;
	}

	async logStorage() {
		console.log(`This NodeStorageManager has ${await this.storage.length()} storages: ${JSON.stringify(await this.storage.keys())}`);
	}
}

export class NodeStorage {
	private readonly storage: LocalStorage;
	private readonly initOptions: InitOptions;

	constructor(storage: LocalStorage, initOptions: InitOptions) {
		this.storage = storage;
		this.initOptions = initOptions;
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	async set<T = any>(key: NodeStorageKey, value: T): Promise<NodePersist.WriteFileResult> {
		return await this.storage.setItem(key, value);
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	async get<T = any>(key: NodeStorageKey, defaultValue?: T): Promise<T> {
		const value = await this.storage.getItem(key);
		return value!==undefined ? value: defaultValue;
	}

	async remove(key: NodeStorageKey): Promise<NodePersist.DeleteFileResult> {
		return await this.storage.removeItem(key);
	}

	async clear(): Promise<void> {
		return await this.storage.clear();
	}

	async logStorage() {
		console.log(`This NodeStorage has ${await this.storage.length()} keys: ${JSON.stringify(await this.storage.keys())}`);
	}
}
