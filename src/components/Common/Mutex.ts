const unlocked = 0
const locked = 1

/**
 * A JavaScript mutex implementation using Atomics.wait(...)
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

		if (this.listeners.length > 0) {
			const listener = this.listeners.shift()!
			this.isLocked = false
			listener()
		} else {
			this.isLocked = false
		}
	}
}
