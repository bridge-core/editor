import { SchemaManager } from '../Manager'
import { RootSchema } from './Root'
import { Schema } from './Schema'
import { dirname, join } from '/@/utils/path'

export class RefSchema extends Schema {
	public readonly schemaType = 'refSchema'

	protected rootSchema: RootSchema
	get types() {
		return this.rootSchema.types
	}

	constructor(location: string, key: string, value: unknown) {
		super(location, key, value)

		if (typeof value !== 'string')
			throw new Error(
				`Invalid $ref type "${typeof value}": ${JSON.stringify(value)}`
			)

		if (value.startsWith('#')) {
			const baseLoc = this.location.split('#/')[0]
			const locWithHash = value === '#' ? baseLoc : `${baseLoc}${value}`

			this.rootSchema =
				SchemaManager.requestRootSchema(locWithHash) ??
				new RootSchema(
					locWithHash,
					'$ref',
					SchemaManager.request(
						baseLoc,
						value === '#' ? undefined : value.replace('#/', '')
					)
				)
		} else {
			const dir = this.location.includes('#/')
				? dirname(this.location.split('#/')[0])
				: dirname(this.location)

			let fileUri: string
			if (value.startsWith('/')) fileUri = `file://${value}`
			else fileUri = join(dir, value).replace('file:/', 'file:///')

			// Support hashes for navigating inside of schemas
			let hash: string | undefined = undefined
			if (fileUri.includes('#/')) {
				;[fileUri, hash] = fileUri.split('#/')
			}

			this.location = fileUri
			this.rootSchema =
				SchemaManager.requestRootSchema(
					hash ? `${fileUri}#/${hash}` : fileUri
				) ??
				new RootSchema(
					hash ? `${fileUri}#/${hash}` : fileUri,
					'$ref',
					SchemaManager.request(this.location, hash)
				)
		}
	}

	getCompletionItems(obj: unknown) {
		return this.rootSchema.getCompletionItems(obj)
	}
	validate(obj: string) {
		return this.rootSchema.validate(obj)
	}
	getSchemasFor(obj: unknown, location: (string | number | undefined)[]) {
		return this.rootSchema.getSchemasFor(obj, [...location])
	}

	getFreeIfSchema() {
		return this.rootSchema.getFreeIfSchema()
	}
}
