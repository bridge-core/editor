import { zip, AsyncZippable } from 'fflate'

const textEncoder = new TextEncoder()

// Polyfill JSZip with fflate

export class JSZip {
	protected zippable: AsyncZippable = {}

	file(
		name: string,
		data: string | Uint8Array,
		options?: { base64?: boolean; binary?: boolean }
	) {
		if (typeof data === 'string') {
			data = textEncoder.encode(options?.base64 ? atob(data) : data)
		}

		return this
	}

	generateAsync(options: any) {
		return new Promise((resolve, reject) =>
			zip(this.zippable, { level: 1 }, (err, data) => {
				if (err) reject(err)
				else resolve(data)
			})
		)
	}
}
