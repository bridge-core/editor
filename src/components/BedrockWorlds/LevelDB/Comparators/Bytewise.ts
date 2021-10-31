export class BytewiseComparator {
	constructor() {}

	public compare(a: Uint8Array, b: Uint8Array): number {
		if (a.length === b.length) {
			return this.compareFixedLength(a, b)
		} else {
			const minLength = Math.min(a.length, b.length)
			const res = this.compareFixedLength(
				a.slice(0, minLength),
				b.slice(0, minLength)
			)

			if (res !== 0) return res

			return a.length - b.length > 0 ? 1 : -1
		}
	}

	/**
	 * Assumption: a and b are of equal length
	 */
	protected compareFixedLength(a: Uint8Array, b: Uint8Array) {
		for (let i = 0; i < a.length; i++) {
			if (a[i] !== b[i]) {
				const res = a[i] - b[i]

				return res > 0 ? 1 : -1
			}
		}

		return 0
	}
}
