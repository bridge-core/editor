import { App } from '/@/App'
import { IModuleConfig } from '../types'
import {
	Exporter,
	IExporter,
} from '/@/components/Projects/Export/Extensions/Exporter'
import { TPackTypeId } from '/@/components/Data/PackType'
import { Project } from '/@/components/Projects/Project/Project'
import { AnyFileHandle } from '/@/components/FileSystem/Types'
import { IOpenTabOptions } from '/@/components/TabSystem/TabSystem'

export const ProjectModule = async ({
	disposables,
	isGlobal,
}: IModuleConfig) => {
	const app = await App.getApp()

	return {
		hasPacks(packs: TPackTypeId[]) {
			return app.project.hasPacks(packs)
		},

		registerExporter(exporter: IExporter) {
			if (isGlobal) {
				app.projectManager.forEachProject((project) => {
					disposables.push(
						project.exportProvider.register(new Exporter(exporter))
					)
				})
			} else {
				disposables.push(
					app.project.exportProvider.register(new Exporter(exporter))
				)
			}
		},

		async compile(configFile: string) {
			const service = await app.project.createDashService(
				'production',
				configFile === 'default'
					? undefined
					: `${app.project.projectPath}/.bridge/compiler/${configFile}`
			)
			await service.setup()

			await service.build()
		},

		async compileFiles(paths: string[]) {
			await app.project.compilerService.updateFiles(paths)
		},

		async unlinkFile(path: string) {
			await app.project.unlinkFile(path)
		},

		onProjectChanged(cb: (projectName: string) => any) {
			const disposable = App.eventSystem.on(
				'projectChanged',
				(project: Project) => cb(project.name)
			)
			disposables.push(disposable)

			return disposable
		},
		onFileChanged(filePath: string, cb: (filePath: string) => any) {
			const disposable = App.eventSystem.on(
				'fileChange',
				([currFilePath, file]) => {
					if (currFilePath === filePath) cb(file)
				}
			)
			disposables.push(disposable)

			return disposable
		},

		async openFile(fileHandle: AnyFileHandle, opts: IOpenTabOptions) {
			await app.project.openFile(fileHandle, opts)
		},
	}
}
