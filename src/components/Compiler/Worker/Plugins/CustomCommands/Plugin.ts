import json5 from 'json5'
import { TCompilerPluginFactory } from '../../TCompilerPluginFactory'
import { setObjectAt } from '/@/utils/walkObject'

export const CustomCommandsPlugin: TCompilerPluginFactory<{
	include: Record<string, string[]>
	isFileRequest: boolean
}> = ({ fileSystem, options: { include = {}, isFileRequest } = {} }) => {
	const isCommand = (filePath: string | null) =>
		filePath?.startsWith('BP/commands/')
	const isMcfunction = (filePath: string | null) =>
		filePath?.startsWith('BP/functions/') &&
		filePath?.endsWith('.mcfunction')

	const loadCommandsFor = (filePath: string) =>
		Object.entries(include).find(([startPath]) =>
			filePath.startsWith(startPath)
		)?.[1]

	return {
		async buildStart() {
			// Load default command locations and merge them with user defined locations
			include = Object.assign(
				await fileSystem.readJSON(
					'data/packages/minecraftBedrock/location/validCommand.json'
				),
				include
			)
		},
		transformPath(filePath) {
			if (isCommand(filePath) && !isFileRequest) return null
		},
		async read(filePath, fileHandle) {
			if (!fileHandle) return

			if (isCommand(filePath) && filePath.endsWith('.js')) {
				const file = await fileHandle.getFile()
				return await file.text()
			} else if (isMcfunction(filePath)) {
				const file = await fileHandle.getFile()
				return await file.text()
			} else if (loadCommandsFor(filePath) && fileHandle) {
				// Currently, MoLang in function files is not supported so we can just load files as JSON
				const file = await fileHandle.getFile()
				try {
					return json5.parse(await file.text())
				} catch (err) {
					console.error(err)
				}
			}
		},
		async require(filePath) {
			if (loadCommandsFor(filePath) || isMcfunction(filePath)) {
				// Register custom commands as JSON/mcfunction file dependencies
				return ['BP/commands/**/*.js']
			}
		},
		async transform(filePath, fileContent) {
			const includePaths = loadCommandsFor(filePath)

			if (includePaths && includePaths.length > 0) {
				// For every MoLang location
				includePaths.forEach((includePath) =>
					// Search it inside of the JSON & transform it if it exists
					setObjectAt<string | string[]>(
						includePath,
						fileContent,
						(commands) => {
							if (!commands) return commands

							commands = Array.isArray(commands)
								? commands
								: [commands]

							// TODO: Transform individual commands

							return commands
						}
					)
				)
			} else if (isMcfunction(filePath)) {
				const commands = (<string>fileContent)
					.split('\n')
					.map((command) => command.trim())
					.filter(
						(command) => command !== '' && !command.startsWith('#')
					)
					.map((command) => `/${command}`)

				// TODO: Transform individual commands

				return commands
					.map((command) => command.trim().slice(1))
					.join('\n')
			}
		},
		finalizeBuild(filePath, fileContent) {
			// Make sure JSON files are transformed back into a format that we can write to disk
			if (loadCommandsFor(filePath) && typeof fileContent !== 'string')
				return JSON.stringify(fileContent, null, '\t')
		},
	}
}
