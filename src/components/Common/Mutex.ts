/**
 * An instance of the Mutex class ensures that calls to specific APIs happen sequentially instead of in parallel.
 */
export class Mutex {
	protected listeners: (() => void)[] = []
	protected isLocked = false

	constructor() {}

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
