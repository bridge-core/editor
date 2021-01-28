import * as Comlink from 'comlink'
import { TaskService } from '@/components/TaskManager/WorkerTask'

export interface IWorkerSettings {
	config: string
}
export interface IBuildConfig {
	mode: 'dev' | 'build'

	plugins: {
		'*'?: TPluginDef[]
		[fileType: string]: TPluginDef[] | undefined
	}
}
export type TPluginDef = string | [string, any]

export class CompilerService extends TaskService<string[], string[]> {
	constructor(
		projectDirectory: FileSystemDirectoryHandle,
		protected baseDirectory: FileSystemDirectoryHandle,
		readonly settings: IWorkerSettings
	) {
		super('compiler', projectDirectory)
	}

	async onStart(updatedFiles: string[]) {
		let buildConfig
		try {
			buildConfig = await this.fileSystem.readJSON(
				`bridge/compiler/${this.settings.config}`
			)
		} catch (err) {
			if (err instanceof Error) return [err.message]
			else return [<string>err]
		}
		console.log(buildConfig)

		return []
	}
}

Comlink.expose(CompilerService, self)
