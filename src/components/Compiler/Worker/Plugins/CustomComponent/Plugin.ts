import json5 from 'json5'
import { get } from 'lodash'
import { TCompilerPluginFactory } from '../../Plugins'
import { Component } from './Component'
import { findCustomComponents } from './findComponents'
import { deepMerge } from '/@/utils/deepmerge'

interface IOpts {
	folder: string
	fileType: string
	getComponentObjects: (fileContent: any) => [string, any][]
}

export function createCustomComponentPlugin({
	folder,
	fileType,
	getComponentObjects,
}: IOpts): TCompilerPluginFactory {
	const usedComponents = new Map<string, [string, string][]>()
	let createAnimFiles: Record<string, any> = {}

	const isComponent = (filePath: string | null) =>
		filePath?.startsWith(`BP/components/${fileType}/`)

	return ({ compileFiles }) => {
		return {
			transformPath(filePath) {
				if (isComponent(filePath)) return null
			},
			async read(filePath, fileHandle) {
				// Even if the fileHandle being undefined has nothing to do with custom components,
				// we still just return "undefined" so we might as well keep the code simple
				if (!fileHandle) return createAnimFiles[filePath]

				if (isComponent(filePath) && filePath.endsWith('.js')) {
					const file = await fileHandle.getFile()
					return await file.text()
				} else if (filePath.startsWith(`BP/${folder}/`)) {
					const file = await fileHandle.getFile()
					return json5.parse(await file.text())
				}
			},
			async load(filePath, fileContent) {
				if (isComponent(filePath)) {
					const component = new Component(fileType, fileContent)

					await component.load()
					return component
				}
			},
			async registerAliases(filePath, fileContent) {
				if (isComponent(filePath))
					return [`${fileType}Component#${fileContent.name}`]
			},
			async require(filePath, fileContent) {
				if (filePath.startsWith(`BP/${folder}/`)) {
					const components = findCustomComponents(
						getComponentObjects(fileContent)
					)

					usedComponents.set(filePath, components)
					return components.map(
						(component) => `${fileType}Component#${component[0]}`
					)
				}
			},
			async transform(filePath, fileContent, dependencies = {}) {
				if (filePath.startsWith(`BP/${folder}/`)) {
					for (const [componentName, location] of usedComponents.get(
						filePath
					) ?? []) {
						const component =
							dependencies[
								`${fileType}Component#${componentName}`
							]
						if (!component) continue

						const parentObj = get(
							fileContent,
							location.split('/'),
							{}
						)
						const componentArgs = parentObj[componentName]
						delete parentObj[componentName]

						// Returns anim & animController files to create
						const files = component.processTemplates(
							fileContent,
							componentArgs,
							location
						)
						createAnimFiles = deepMerge(createAnimFiles, files)
					}
				}
			},
			finalizeBuild(filePath, fileContent) {
				if (filePath.startsWith(`BP/${folder}/`))
					return JSON.stringify(fileContent, null, '\t')
			},
			async buildEnd() {
				await compileFiles(Object.keys(createAnimFiles), false)
				createAnimFiles = {}
			},
		}
	}
}

export const CustomEntityComponentPlugin = createCustomComponentPlugin({
	folder: 'entities',
	fileType: 'entity',
	getComponentObjects: (fileContent) => [
		[
			'minecraft:entity/components',
			fileContent?.['minecraft:entity']?.components ?? {},
		],
		...Object.entries(
			fileContent?.['minecraft:entity']?.component_groups ?? {}
		).map(
			([groupName, groupContent]) =>
				<[string, any]>[
					`minecraft:entity/component_groups/${groupName}`,
					groupContent,
				]
		),
	],
})

export const CustomItemComponentPlugin = createCustomComponentPlugin({
	folder: 'items',
	fileType: 'item',
	getComponentObjects: (fileContent) => [
		[
			'minecraft:item/components',
			fileContent?.['minecraft:item']?.components ?? {},
		],
	],
})

export const CustomBlockComponentPlugin = createCustomComponentPlugin({
	folder: 'blocks',
	fileType: 'block',
	getComponentObjects: (fileContent) => [
		[
			'minecraft:block/components',
			fileContent?.['minecraft:block']?.components ?? {},
		],
		...(<any[]>fileContent?.['minecraft:block']?.permutations ?? []).map(
			(permutation, index) =>
				<[string, any]>[
					`minecraft:block/permutations/${index}/components`,
					permutation.components ?? {},
				]
		),
	],
})
