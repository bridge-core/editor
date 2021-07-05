import json5 from 'json5'
import { get } from 'lodash'
import { TCompilerPluginFactory } from '../../TCompilerPluginFactory'
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
}: IOpts): TCompilerPluginFactory<{
	isFileRequest: boolean
	mode: 'dev' | 'build'
	v1CompatMode?: boolean
}> {
	const usedComponents = new Map<string, [string, string][]>()
	let createAnimFiles: Record<string, any> = {}

	const isPlayerFile = (
		filePath: string | null,
		getAliases: (file: string) => string[]
	) =>
		fileType === 'item' &&
		filePath?.startsWith('BP/entities/') &&
		getAliases(filePath).includes('minecraft:player')

	return ({ compileFiles, getAliases, options }) => {
		const isComponent = (filePath: string | null) =>
			options.v1CompatMode
				? filePath?.startsWith(`BP/components/`)
				: filePath?.startsWith(`BP/components/${fileType}/`)

		return {
			buildStart() {
				usedComponents.clear()
				createAnimFiles = {}
			},
			transformPath(filePath) {
				if (isComponent(filePath) && !options.isFileRequest) return null
			},
			async read(filePath, fileHandle) {
				// Even if the fileHandle being undefined has nothing to do with custom components,
				// we still just return "undefined" so we might as well keep the code simple
				if (!fileHandle)
					return createAnimFiles[filePath]
						? json5.parse(createAnimFiles[filePath])
						: undefined

				if (isComponent(filePath) && filePath.endsWith('.js')) {
					const file = await fileHandle.getFile()
					return await file.text()
				} else if (
					filePath.startsWith(`BP/${folder}/`) ||
					isPlayerFile(filePath, getAliases)
				) {
					const file = await fileHandle.getFile()
					try {
						return json5.parse(await file.text())
					} catch (err) {
						if (!options.isFileRequest)
							console.error(
								`Error within file "${filePath}": ${err}`
							)
						return {
							__error__: `Failed to load original file: ${err}`,
						}
					}
				}
			},
			async load(filePath, fileContent) {
				if (isComponent(filePath) && typeof fileContent === 'string') {
					const component = new Component(
						fileType,
						fileContent,
						options.mode,
						!!options.v1CompatMode
					)

					const loadedCorrectly = await component.load()
					return loadedCorrectly ? component : fileContent
				}
			},
			async registerAliases(filePath, fileContent) {
				if (isComponent(filePath))
					return [`${fileType}Component#${fileContent.name}`]
			},
			async require(filePath, fileContent) {
				if (isPlayerFile(filePath, getAliases))
					return ['BP/components/item/**/*.js', 'BP/items/**/*.json']

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
				if (isPlayerFile(filePath, getAliases)) {
					// Get item components from the dependencies
					const itemComponents = <Component[]>Object.entries(
						dependencies
					)
						.filter(([depName]) =>
							depName.startsWith('itemComponent#')
						)
						.map(([_, component]) => component)

					for (const component of itemComponents) {
						if (!component) return

						createAnimFiles = deepMerge(
							createAnimFiles,
							await component.processAnimations(fileContent)
						)
					}
				} else if (filePath.startsWith(`BP/${folder}/`)) {
					const components = new Set<Component>()

					// Apply components
					for (const [componentName, location] of usedComponents.get(
						filePath
					) ?? []) {
						const component = <Component>(
							dependencies[
								`${fileType}Component#${componentName}`
							]
						)
						if (!component) continue

						const parentObj = get(
							fileContent,
							location.split('/'),
							{}
						)
						const componentArgs = parentObj[componentName]
						delete parentObj[componentName]

						await component.processTemplates(
							fileContent,
							componentArgs,
							location
						)
						components.add(component)
					}

					// Items must not & blocks don't need to process animation(s/ controllers)
					if (fileType !== 'entity') return

					// Register animation (controllers) that this entity uses
					for (const component of components) {
						createAnimFiles = deepMerge(
							createAnimFiles,
							await component.processAnimations(fileContent)
						)
					}

					// Reset animation(s/ controllers)
					for (const component of components) {
						component.reset()
					}
				}
			},
			finalizeBuild(filePath, fileContent) {
				// Necessary to make auto-completions work for TypeScript components
				if (isComponent(filePath)) {
					return (<Component>fileContent).toString()
				} else if (
					filePath.startsWith(`BP/${folder}/`) ||
					createAnimFiles[filePath]
				)
					return JSON.stringify(fileContent, null, '\t')
			},
			async buildEnd() {
				const animFiles = Object.keys(createAnimFiles)
				if (animFiles.length > 0) await compileFiles(animFiles)
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
		...(<any[]>fileContent?.['minecraft:entity']?.permutations ?? []).map(
			(permutation: any, index: number) =>
				<[string, any]>[
					`minecraft:entity/permutations/${index}/components`,
					permutation?.components ?? {},
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
