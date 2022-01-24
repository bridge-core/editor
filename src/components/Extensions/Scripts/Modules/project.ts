import { App } from '/@/App'
import { IModuleConfig } from '../types'
import {
	Exporter,
	IExporter,
} from '/@/components/Projects/Export/Extensions/Exporter'
import { TPackTypeId } from '/@/components/Data/PackType'

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
					: `projects/${app.project.name}/.bridge/compiler/${configFile}`
			)

			await service.build()
		},

		async compileFiles(paths: string[]) {
			await app.project.compilerService.updateFiles(paths)
		},

		async unlinkFile(path: string) {
			await app.project.unlinkFile(path)
		},
	}
}
