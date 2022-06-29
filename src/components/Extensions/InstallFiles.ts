import { TPackTypeId } from '../Data/PackType'
import { App } from '/@/App'
import { FileSystem } from '/@/components/FileSystem/FileSystem'
import { iterateDir } from '/@/utils/iterateDir'
import { join } from '/@/utils/path'

export class InstallFiles {
	constructor(
		protected fileSystem: FileSystem,
		protected contributeFiles: Record<
			string,
			{ pack: TPackTypeId; path: string }
		>
	) {}

	async execute(isGlobal: boolean) {
		const app = App.instance

		await app.projectManager.projectReady.fired

		for (const [from, to] of Object.entries(this.contributeFiles)) {
			const projects = isGlobal ? app.projects : [app.project]

			if (await this.fileSystem.fileExists(from)) {
				// Handle file contributions
				const file = await this.fileSystem.readFile(from)

				for (const project of projects) {
					const target = project.config.resolvePackPath(
						to.pack,
						to.path
					)
					await app.fileSystem.writeFile(
						target,
						await file.arrayBuffer()
					)
				}
			} else if (await this.fileSystem.directoryExists(from)) {
				// Handle directory contributions
				await iterateDir(
					await this.fileSystem.getDirectoryHandle(from),
					async (fileHandle, filePath) => {
						for (const project of projects) {
							const target = project.config.resolvePackPath(
								to.pack,
								to.path
							)
							const newFileHandle = await app.fileSystem.getFileHandle(
								join(target, filePath),
								true
							)
							await app.fileSystem.copyFileHandle(
								fileHandle,
								newFileHandle
							)
						}
					}
				)
			} else {
				console.warn(
					`Failed to install files from "${from}": No such file or directory`
				)
				continue
			}
		}
	}
}
