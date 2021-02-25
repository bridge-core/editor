import { IFileData } from '../../Main'
import { Component } from './Component'
import { deepMergeAll } from '/@/utils/deepmerge'

export function iterateComponentObjects(
	filePath: string,
	componentObjects: [string, any][],
	components: Map<string, Component>,
	files: Map<string, IFileData>
) {
	return deepMergeAll(
		componentObjects
			.map(([location, entityComponents]) =>
				iterateComponents(
					filePath,
					entityComponents,
					components,
					files,
					location
				)
			)
			.flat()
	)
}

function iterateComponents(
	filePath: string,
	entityComponents: any,
	components: Map<string, Component>,
	files: Map<string, IFileData>,
	location: string
) {
	const templates = []

	for (const componentName in entityComponents) {
		if (componentName.startsWith('minecraft:')) continue

		const component = components.get(componentName)
		if (!component)
			throw new Error(`Could not resolve component "${componentName}"`)

		templates.push(
			component.getTemplate(entityComponents[componentName], location)
		)

		// Register that the entity file depends on the component file
		const file = files.get(component.filePath)
		if (!file)
			files.set(component.filePath, { updateFiles: new Set([filePath]) })
		else file.updateFiles.add(filePath)

		delete entityComponents[componentName]
	}

	return templates
}
