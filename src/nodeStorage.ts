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

export class NodeStorageManager {
	private readonly storage: LocalStorage;
	private readonly initOptions: InitOptions;

	constructor(initOptions?: InitOptions) {
		// Merge initOptions with default initOptions
		this.initOptions = Object.assign({
			dir: path.join(process.cwd(), 'node_storage'),
			logging: false,
		} as InitOptions, initOptions);

		// Create and initialize a new instace of LocalStorage
		this.storage = NodePersist.create(this.initOptions);
		this.storage.initSync(this.initOptions);
		console.log(`Storage initialized with options ${JSON.stringify(this.initOptions)}`);
	}

	async createStorage(storageName: string): Promise<NodeStorage> {
		const initOptions: InitOptions = {};
		Object.assign(initOptions, this.initOptions, { dir: path.join(this.initOptions.dir!, '.' + storageName) } as InitOptions);
		console.log(`Creating storage context ${storageName} with options ${JSON.stringify(initOptions)}`);
		const storage = NodePersist.create(initOptions);
		await storage.init(initOptions);
		return new NodeStorage(storage, initOptions);
	}

	async removeStorage(storageName: string): Promise<boolean> {
		const dir = path.join(this.initOptions.dir!, '.' + storageName);
		try {
			await rm(dir, { recursive: true });
			console.log('Storage removed');
			return true;
		} catch (err) {
			console.error('Error removing storage:', err);
			return false;
		}
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
		return await this.storage.getItem(key) ?? defaultValue;
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
