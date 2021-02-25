import json5 from 'json5'
import { TCompilerPluginFactory } from '../../Plugins'
import { Component } from './Component'
import { iterateComponentObjects } from './iterateComponents'
import { deepMerge } from '/@/utils/deepmerge'
import { iterateDir } from '/@/utils/iterateDir'

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
	return ({ options, fileSystem, getFiles }) => {
		const components = new Map<string, Component>()

		return {
			async buildStart() {
				components.clear()

				let componentDir: FileSystemDirectoryHandle
				try {
					componentDir = await fileSystem.getDirectoryHandle(
						`BP/components/${fileType}`
					)
				} catch {
					return
				}

				await iterateDir(componentDir, async (fileHandle, filePath) => {
					const component = new Component(
						fileHandle,
						`BP/components/${fileType}/${filePath}`
					)
					await component.load()

					if (!component.name) {
						console.error(
							`Component with invalid name: "component.name"`
						)
						return
					}
					if (components.has(component.name)) {
						console.error(
							`Component with name "${component.name}" already exists`
						)
						return
					}

					components.set(component.name, component)
				})
			},
			async load(filePath, fileHandle) {
				if (filePath.startsWith('BP/components/')) return {}
				else if (filePath.startsWith(`BP/${folder}/`)) {
					const file = await fileHandle.getFile()
					return json5.parse(await file.text())
				}
			},
			async transform(filePath, fileContent) {
				if (filePath.startsWith(`BP/${folder}/`))
					return deepMerge(
						fileContent,
						iterateComponentObjects(
							filePath,
							getComponentObjects(fileContent),
							components,
							getFiles()
						)
					)
			},
			finalizeBuild(filePath, fileContent) {
				if (filePath.startsWith('BP/components/')) return null
				else if (filePath.startsWith(`BP/${folder}/`))
					return JSON.stringify(fileContent)
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
	],
})
