import { ignoreFields, schemaRegistry } from './Registry'
import type { IfSchema } from './Schema/IfSchema'
import type { Schema } from './Schema/Schema'
import type { ThenSchema } from './Schema/ThenSchema'
import { walkObject } from '/@/utils/walkObject'

export class SchemaManager {
	protected static lib: Record<string, any> = {}
	static setJSONDefaults(lib: Record<string, any>) {
		this.lib = lib
	}

	static request(fileUri: string, hash?: string) {
		const requested = this.lib[fileUri]
		if (!requested) throw new Error(`Couldn't find schema for "${fileUri}"`)

		if (!hash) {
			return requested.schema
		} else {
			let subSchema: any
			walkObject(hash, requested.schema, (data) => (subSchema = data))
			if (subSchema === undefined)
				throw new Error(`Couldn't find hash ${hash} @ ${fileUri}`)

			return subSchema
		}
	}

	static createSchemas(location: string, obj: any) {
		if (typeof obj !== 'object') {
			console.warn(`Unexpected schema type "${typeof obj}" @ ${location}`)
			return []
		}

		let lastIfSchema: IfSchema | undefined
		return <Schema[]>Object.entries(obj)
			.map(([key, value]) => {
				if (value === undefined) return

				const Class = schemaRegistry.get(key)

				if (Class === undefined) {
					if (ignoreFields.has(key)) return

					console.warn(
						`Schema field not implemented: <${key}, ${value}> @ ${location}`
					)
					return
				}

				const schema = new Class(location, key, value)

				if (key === 'if') lastIfSchema = <IfSchema>schema
				else if (key === 'then') {
					if (!lastIfSchema) {
						console.warn(`"then" schema without "if" @ ${location}`)
						return
					}

					;(<ThenSchema>schema).receiveIfSchema(lastIfSchema)
					lastIfSchema = undefined
				}

				return schema
			})
			.filter((schema) => schema !== undefined)
	}
}
