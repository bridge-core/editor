/**
 * An instance of the Mutex class ensures that calls to specific APIs happen sequentially instead of in parallel.
 */
export class Mutex {
	protected listeners: (() => void)[] = []
	protected isLocked = false

	constructor() {}

	/**
	 * Lock the mutex. If it is already locked, the function will wait until it is unlocked.
	 *
	 * @returns When the mutex is unlocked
	 */
	lock() {
		return new Promise<void>(async (resolve, reject) => {
			if (this.isLocked) {
				this.listeners.push(() => {
					this.isLocked = true
					resolve()
				})
			} else {
				this.isLocked = true
				resolve()
			}
		})
	}

	/**
	 * Unlock the mutex.
	 *
	 * @throws If the mutex is not locked.
	 */
	unlock() {
		if (!this.isLocked) {
			throw new Error('Trying to unlock a mutex that is not locked')
		}

		this.isLocked = false

		if (this.listeners.length > 0) {
			const listener = this.listeners.shift()!

			listener()
		}
	}
}
