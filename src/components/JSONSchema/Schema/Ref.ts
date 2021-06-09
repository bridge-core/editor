import { SchemaManager } from '../Manager'
import { RootSchema } from './Root'
import { Schema } from './Schema'
import { dirname, join } from '/@/utils/path'

export class RefSchema extends Schema {
	protected rootSchema: RootSchema
	constructor(location: string, key: string, value: unknown) {
		super(location, key, value)

		if (typeof value !== 'string')
			throw new Error(
				`Invalid $ref type "${typeof value}": ${JSON.stringify(value)}`
			)

		const dir = dirname(this.location)
		let fileUri = join(dir, value).replace('file:/', 'file:///')

		// Support hashes for navigating inside of schemas
		let hash: string | undefined = undefined
		if (fileUri.includes('#/')) {
			;[fileUri, hash] = fileUri.split('#/')
		}

		this.location = fileUri
		this.rootSchema = new RootSchema(
			this.location,
			'$ref',
			SchemaManager.request(this.location, hash)
		)
	}

	getCompletionItems(obj: string) {
		return this.rootSchema.getCompletionItems(obj)
	}
	validate(obj: string) {
		return this.rootSchema.validate(obj)
	}
	getSchemasFor(location: (string | number)[]) {
		return this.rootSchema.getSchemasFor([...location])
	}
}
