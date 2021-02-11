export class Queue<T> {
	protected array: T[] = []
	constructor(
		protected maxSize: number = Infinity,
		iterable?: Iterable<T> | null | undefined
	) {
		for (const e of iterable ?? []) this.add(e)
	}

	add(element: T) {
		if (this.array.length >= this.maxSize) this.array.unshift()
		this.array.push(element)

		return this
	}

	toJSON() {
		return JSON.stringify(this.array)
	}
	[Symbol.iterator]() {
		return this.array.values()
	}

	get size() {
		return this.maxSize
	}
	get elementCount() {
		return this.array.length
	}
}
