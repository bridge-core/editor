import * as Comlink from 'comlink'
import { TaskService } from '@/components/TaskManager/WorkerTask'
import { hooks, loadPlugins, TCompilerHook, TCompilerPlugin } from './Plugins'
import { FileSystem } from '@/components/FileSystem/Main'
import { FileType } from '@/components/Data/FileType'
import { CompilerFile } from './File'

export interface IWorkerSettings {
	config: string
	plugins: Record<string, string>
}
export interface IBuildConfig {
	mode: 'dev' | 'build'

	plugins: IBuildConfigPlugins
}
export interface IBuildConfigPlugins {
	'*'?: TPluginDef[]
	'#default'?: TPluginDef[]
	[fileType: string]: TPluginDef[] | undefined
}
export type TPluginDef = string | [string, any]

export class CompilerService extends TaskService<string[], string[]> {
	protected buildConfig!: IBuildConfig
	protected plugins!: Map<string, { exports?: TCompilerPlugin }>

	constructor(
		projectDirectory: FileSystemDirectoryHandle,
		protected baseDirectory: FileSystemDirectoryHandle,
		readonly settings: IWorkerSettings
	) {
		super('compiler', projectDirectory)
	}

	async onStart(updatedFiles: string[]) {
		const globalFs = new FileSystem(this.baseDirectory)
		await FileType.setup(globalFs)

		try {
			this.buildConfig = await this.fileSystem.readJSON(
				`bridge/compiler/${this.settings.config}`
			)
		} catch (err) {
			return [
				`Unable to find specified build config "bridge/compiler/${this.settings.config}"`,
			]
		}

		this.plugins = await loadPlugins(globalFs, this.settings.plugins)

		const files = await Promise.all(
			updatedFiles.map(
				async updatedFile =>
					new CompilerFile(
						updatedFile,
						await globalFs.getFileHandle(updatedFile)
					)
			)
		)

		for (const hook of hooks) {
			await this.runHook(files, hook)
		}

		return []
	}

	async runHook(files: CompilerFile<unknown>[], hook: TCompilerHook) {
		await Promise.all(
			files.map(file =>
				file.runHook(this.buildConfig.plugins, this.plugins, hook)
			)
		)
	}
}

Comlink.expose(CompilerService, self)
