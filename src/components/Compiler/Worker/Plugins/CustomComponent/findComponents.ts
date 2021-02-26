export function findCustomComponents(componentObjects: [string, any][]) {
	const components: [string, string][] = []

	for (const [location, componentObject] of componentObjects) {
		components.push(...scanComponentObject(componentObject, location))
	}

	return components
}

function scanComponentObject(componentObject: any, location: string) {
	const components: [string, string][] = []

	for (const componentName in componentObject) {
		if (
			componentName.startsWith('minecraft:') ||
			componentName.startsWith('tag:')
		)
			continue

		components.push([componentName, location])
	}

	return components
}
