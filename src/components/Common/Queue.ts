export class Queue<T> {
	protected array: T[] = []
	constructor(
		protected maxSize: number = Infinity,
		iterable?: Iterable<T> | null | undefined
	) {
		for (const e of iterable ?? []) this.add(e)
	}

	add(
		element: T,
		isEquals: (e1: T, e2: T) => boolean = this.isEquals.bind(this)
	) {
		const index = this.array.findIndex((e) => isEquals(e, element))
		if (index > -1) {
			this.array.splice(index, 1)
			this.array.unshift(element)
			return this
		}

		if (this.array.length >= this.maxSize) this.array.pop()
		this.array.unshift(element)

		return this
	}
	remove(
		element: T,
		isEquals: (e1: T, e2: T) => boolean = this.isEquals.bind(this)
	) {
		const index = this.array.findIndex((e) => isEquals(e, element))
		if (index > -1) this.array.splice(index, 1)

		return this
	}
	clear() {
		this.array = []
	}
	protected isEquals(e1: T, e2: T) {
		return e1 === e2
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
	get elements() {
		return [...this.array]
	}
}
