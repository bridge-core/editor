import { App } from '/@/App'
import { IModuleConfig } from '../types'
import {
	Exporter,
	IExporter,
} from '/@/components/Projects/Export/Extensions/Exporter'
import { TPackTypeId } from '/@/components/Data/PackType'
import { Project } from '/@/components/Projects/Project/Project'

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
	}
}
