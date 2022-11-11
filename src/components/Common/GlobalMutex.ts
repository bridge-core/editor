import { Mutex } from './Mutex'

/**
 * A global mutex manages multiple different, keyed mutexes.
 */
export class GlobalMutex {
	protected mutexMap = new Map<string, Mutex>()

	/**
	 * Lock the mutex with the given key. Creates the mutex if it does not exist.
	 *
	 * @param key Mutex to lock
	 */
	async lock(key: string) {
		let mutex = this.mutexMap.get(key)
		if (!mutex) {
			mutex = new Mutex()
			this.mutexMap.set(key, mutex)
		}

		await mutex.lock()
	}

	/**
	 * Unlock the mutex with the given key.
	 *
	 * @throws If the mutex does not exist.
	 * @param key
	 */
	unlock(key: string) {
		const mutex = this.mutexMap.get(key)
		if (!mutex) {
			throw new Error('Trying to unlock a mutex that does not exist')
		}

		mutex.unlock()
	}
}
