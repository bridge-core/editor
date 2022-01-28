import { App } from '/@/App'
import { join } from '/@/utils/path'
import { isMatch } from 'bridge-common-utils'
import './Monaco'

export interface IContributesSchemas {
	// TODO: Implement replacing existing schemas
	// type?: 'add' | 'replace'
	fileType: string
	path: string
}
export interface IExtensionSchema {
	scope: ISchemaScope
	schema: any
}
export interface ISchemaScope {
	from: string[]
	to: string[]
}

export class ExtensionSchemaProvider {
	/**
	 * Key: fileType
	 * Value: Loaded extension schema
	 */
	protected schemas: Record<string, IExtensionSchema[]> = {}

	async load(
		extensionDir: string,
		contributesSchemas: IContributesSchemas[]
	) {
		const fs = await App.getApp().then((app) => app.fileSystem)

		for (const { fileType, path } of contributesSchemas) {
			const fullPath = join(extensionDir, path)
			const jsonData = await fs.readJSON(fullPath)
			if (!jsonData.schema) {
				console.error(
					`Failed to load extension schema "${fullPath}": Missing schema property`
				)
			} else if (
				!jsonData.scope ||
				!Array.isArray(jsonData.scope.from) ||
				!Array.isArray(jsonData.scope.to)
			) {
				console.error(
					`Failed to load extension schema "${fullPath}": Missing or invalid scope property`
				)
			}

			if (!this.schemas[fileType]) this.schemas[fileType] = []
			this.schemas[fileType].push({
				scope: jsonData.scope,
				schema: jsonData.schema,
			})
		}

		console.log(
			this.schemas,
			this.relevantSchemas(
				'1.18.0',
				'entity',
				'minecraft:entity/events/test/execute'
			)
		)
	}

	relevantSchemas(formatVersion: string, fileType: string, location: string) {
		const potentialSchemas = this.schemas[fileType] ?? []

		return potentialSchemas
			.filter(({ schema, scope }) => {
				const schemaMatched = isMatch(
					location,
					this.getAllScopeVariants(scope)
				)
				console.log(
					location,
					this.getAllScopeVariants(scope),
					schemaMatched
				)

				return schemaMatched
			})
			.map(({ schema }) => schema)
	}

	getAllScopeVariants(scope: ISchemaScope) {
		/**
		 * Transform scope.to into an array of scope end variants
		 *
		 * @examples
		 * "execute/commands/*" => ["execute", "execute/commands", "execute/commands/*"]
		 * "foo/bar/foo" => ["foo", "foo/bar", "foo/bar/foo"]
		 */
		const scopeEndVariants = scope.to.flatMap((scope) => {
			const parts = scope.split('/')
			const variants = []
			for (let i = 0; i < parts.length; i++) {
				variants.push(parts.slice(0, i + 1).join('/'))
			}
			return variants
		})

		/**
		 * Now combine the scopeEndVariants with the scope.from variants
		 *
		 * In the following examples "* /" is meant without the space. If we would remove the space, this would end the block comment
		 * @example
		 *
		 * "minecraft:entity/events/*" + "execute/commands/*" => ["minecraft:entity/events/*", "minecraft:entity/events/* /execute", "minecraft:entity/events/* /execute/commands", "minecraft:entity/events/* /execute/commands/*"]
		 */
		const scopeVariants = scope.from.flatMap((fromScope) => {
			return [fromScope].concat(
				scopeEndVariants.map(
					(endVariant) => `${fromScope}/${endVariant}`
				)
			)
		})

		return scopeVariants
	}
}
