import { IFileData } from '../../Main'
import { Component } from './Component'

export function iterateComponentObjects(
	filePath: string,
	fileContent: any,
	componentObjects: [string, any][],
	components: Map<string, Component>,
	files: Map<string, IFileData>
) {
	for (const [location, componentObject] of componentObjects) {
		iterateComponents(
			filePath,
			fileContent,
			componentObject,
			components,
			files,
			location
		)
	}
}

function iterateComponents(
	filePath: string,
	fileContent: any,
	componentObject: any,
	components: Map<string, Component>,
	files: Map<string, IFileData>,
	location: string
) {
	for (const componentName in componentObject) {
		if (componentName.startsWith('minecraft:')) continue

		const component = components.get(componentName)
		if (!component)
			throw new Error(`Could not resolve component "${componentName}"`)

		const componentArgs = componentObject[componentName]
		delete componentObject[componentName]

		component.processTemplates(fileContent, componentArgs, location)

		// Register that the entity file depends on the component file
		const file = files.get(component.filePath)
		if (!file)
			files.set(component.filePath, { updateFiles: new Set([filePath]) })
		else file.updateFiles.add(filePath)
	}
}
