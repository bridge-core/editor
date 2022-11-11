import { ignoreFields, schemaRegistry } from './Registry'
import { ConstSchema } from './Schema/Const'
import type { IfSchema } from './Schema/IfSchema'
import type { RootSchema } from './Schema/Root'
import type { Schema } from './Schema/Schema'
import type { ThenSchema } from './Schema/ThenSchema'
import { walkObject } from 'bridge-common-utils'
import { ElseSchema } from './Schema/ElseSchema'

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
			console.warn(
				`Couldn't find schema for "${fileUri}"${
					hash ? `(#${hash})` : ''
				}`
			)
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
			return { schemas: [new ConstSchema(location, '', obj)] }
		}

		const schemas: Schema[] = []
		// Parse out description and title of the current schema
		const description =
			typeof obj.description === 'string' ? obj.description : undefined
		const title = typeof obj.title === 'string' ? obj.title : undefined

		for (const [key, value] of Object.entries(obj)) {
			if (value === undefined) continue

			const Class = schemaRegistry.get(key)

			if (Class === undefined) {
				if (ignoreFields.has(key)) continue

				console.warn(
					`Schema field not implemented: <${key}, ${value}> @ ${location}`
				)
				continue
			}

			const schema = new Class(location, key, value)

			if (key === 'then' || key === 'else') {
				let ifSchemas = <IfSchema[]>schemas
					.reverse()
					.map((schema) => {
						if (schema.schemaType === 'ifSchema') return schema
						else if (schema.schemaType === 'refSchema')
							return (<RootSchema>schema).getFreeIfSchema()
					})
					.filter((schema) => schema !== undefined)

				// We reverse the schemas array above so index 0 is the last schema
				let lastIfSchema = ifSchemas[0]

				if (!lastIfSchema) {
					console.warn(`"${key}" schema without "if" @ ${location}`)
					lastIfSchema = <IfSchema>(
						new (schemaRegistry.get('if')!)(location, 'if', true)
					)
				}

				;(<ThenSchema | ElseSchema>schema).receiveIfSchema(lastIfSchema)
			}

			schemas.push(schema)
		}

		return {
			schemas,
			description,
			title,
		}
	}
}
