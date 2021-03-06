import type { IFileData } from './Compiler'

export function resolveFileOrder(
	files: string[],
	fileMap: Map<string, IFileData>
) {
	const resolved = new Set<IFileData>()

	for (const filePath of files) {
		const file = fileMap.get(filePath)

		if (!file || !file.isLoaded || resolved.has(file)) continue
		resolveSingle(file, fileMap, resolved, new Set<IFileData>())
	}

	return resolved
}

export function resolveSingle(
	file: IFileData,
	files: Map<string, IFileData>,
	resolved: Set<IFileData>,
	unresolved: Set<IFileData>
) {
	unresolved.add(file)

	for (const depFileId of file.dependencies) {
		const depFile = files.get(depFileId)
		if (!depFile)
			throw new Error(
				`Undefined file dependency: "${file.filePath}" requires "${depFileId}"`
			)

		if (!resolved.has(depFile)) {
			if (unresolved.has(depFile))
				throw new Error('Circular dependency detected!')
			resolveSingle(depFile, files, resolved, unresolved)
		}
	}

	resolved.add(file)
	unresolved.delete(file)
}
