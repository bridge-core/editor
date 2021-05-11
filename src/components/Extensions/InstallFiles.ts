import { App } from '/@/App'
import { FileSystem } from '/@/components/FileSystem/FileSystem'
import { iterateDir } from '/@/utils/iterateDir'
import { join } from '/@/utils/path'

export class InstallFiles {
	constructor(
		protected fileSystem: FileSystem,
		protected install: Record<string, string>
	) {}

	async execute(isGlobal: boolean) {
		const app = App.instance

		for (const [from, to] of Object.entries(this.install)) {
			if (!(await this.fileSystem.directoryExists(from))) {
				console.warn(
					`Failed to install files from "${from}/": No such directory`
				)
				continue
			}

			const projects = isGlobal ? app.projects : [app.project]

			await iterateDir(
				await this.fileSystem.getDirectoryHandle(from),
				async (fileHandle, filePath) => {
					for (const project of projects) {
						const newFileHandle = await project.fileSystem.getFileHandle(
							join(to, filePath),
							true
						)
						await project.fileSystem.copyFileHandle(
							fileHandle,
							newFileHandle
						)
					}
				}
			)
		}
	}
}
