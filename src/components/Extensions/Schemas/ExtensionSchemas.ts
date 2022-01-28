import { App } from '/@/App'
import { join } from '/@/utils/path'
import { isMatch } from 'bridge-common-utils'
import './Monaco'

export interface IContributesSchemas {
	// TODO: Implement replacing existing schemas
	// type?: 'add' | 'replace'
	fileType: string
	scope: ISchemaScope
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

		for (const { fileType, path, scope } of contributesSchemas) {
			const fullPath = join(extensionDir, path)
			const schema = await fs.readJSON(fullPath)

			if (
				!scope ||
				!Array.isArray(scope.from) ||
				!Array.isArray(scope.to)
			) {
				console.error(
					`Failed to load extension schema "${fullPath}": Missing or invalid scope property inside of extension manifest`
				)
			}

			if (!this.schemas[fileType]) this.schemas[fileType] = []
			this.schemas[fileType].push({
				scope,
				schema,
			})
		}
	}

	relevantSchemas(formatVersion: string, fileType: string, location: string) {
		const potentialSchemas = this.schemas[fileType] ?? []

		return potentialSchemas
			.filter(({ scope }) => {
				return isMatch(location, this.getAllScopeVariants(scope))
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
