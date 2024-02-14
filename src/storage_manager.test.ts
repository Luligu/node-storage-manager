/* eslint-disable @typescript-eslint/no-unused-vars */
import { NodeStorageManager, NodeStorage } from '../src/nodeStorage';


describe('NodeStorageManager with NodeStorage', () => {
	let storageManager: NodeStorageManager;
	let storage: NodeStorage; 

	beforeAll(async () => {
		storageManager = new NodeStorageManager();
		storage = await storageManager.createStorage('testStorage');
	});

	it('should return the number of the storages created', async () => {
		const keys = await storageManager.getStorageNames();
		console.log('getStorageNames()', keys);
		expect(keys?.length).toEqual(1);
	});

	it('should return the name of the storage created', async () => {
		const keys = await storageManager.getStorageNames();
		console.log('getStorageNames()', keys);
		expect(keys).toEqual(['testStorage']);
	});

	it('should return the number of storages created', async () => {
		await storageManager.createStorage('testStorage 2');
		await storageManager.createStorage('testStorage 3');
		const keys = await storageManager.getStorageNames();
		console.log('getStorageNames()', keys);
		expect(keys?.length).toEqual(3);
	});

	it('should return the names of storages created', async () => {
		let keys = await storageManager.getStorageNames();
		const expectedNames = ['testStorage','testStorage 2','testStorage 3'];
		expect(keys).toEqual(expectedNames);

		await storageManager.removeStorage('testStorage 2');
		keys = await storageManager.getStorageNames();
		expect(keys).toEqual(['testStorage','testStorage 3']);

		await storageManager.removeStorage('testStorage 3');
		keys = await storageManager.getStorageNames();
		expect(keys).toEqual(['testStorage']);
	});

});