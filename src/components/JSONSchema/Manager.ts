import { ignoreFields, schemaRegistry } from './Registry'
import { ConstSchema } from './Schema/Const'
import type { IfSchema } from './Schema/IfSchema'
import type { RootSchema } from './Schema/Root'
import type { Schema } from './Schema/Schema'
import type { ThenSchema } from './Schema/ThenSchema'
import { walkObject } from '/@/utils/walkObject'

export class SchemaManager {
	protected static lib: Record<string, any> = {}
	protected static rootSchemas = new Map<string, RootSchema>()

	static setJSONDefaults(lib: Record<string, any>) {
		this.lib = lib
		this.rootSchemas.clear()
	}

	static request(fileUri: string, hash?: string) {
		const requested = this.lib[fileUri]
		if (!requested) {
			console.warn(`Couldn't find schema for "${fileUri}"`)
			return {}
		}

		if (!hash) {
			return requested.schema
		} else {
			let subSchema: any
			walkObject(hash, requested.schema, (data) => (subSchema = data))
			if (subSchema === undefined)
				console.error(`Couldn't find hash ${hash} @ ${fileUri}`)

			return subSchema ?? {}
		}
	}
	static addRootSchema(location: string, rootSchema: RootSchema) {
		this.rootSchemas.set(location, rootSchema)
		return rootSchema
	}
	static requestRootSchema(location: string) {
		return this.rootSchemas.get(location)
	}

	static createSchemas(location: string, obj: any) {
		if (typeof obj !== 'object') {
			console.warn(`Unexpected schema type "${typeof obj}" @ ${location}`)
			return [new ConstSchema(location, '', obj)]
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
