import { Mutex } from './Mutex'

/**
 * An instance of the Mutex class ensures that calls to specific APIs happen sequentially instead of in parallel.
 */
export class GlobalMutex {
	protected mutexMap = new Map<string, Mutex>()

	async lock(key: string) {
		let mutex = this.mutexMap.get(key)
		if (!mutex) {
			mutex = new Mutex()
			this.mutexMap.set(key, mutex)
		}

		await mutex.lock()
	}

	unlock(key: string) {
		const mutex = this.mutexMap.get(key)
		if (!mutex) {
			throw new Error('Trying to unlock a mutex that does not exist')
		}

		mutex.unlock()
	}
}
