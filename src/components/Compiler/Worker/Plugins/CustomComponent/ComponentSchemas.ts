import { Component, DefaultConsole } from 'dash-compiler'
import { App } from '/@/App'
import { AnyDirectoryHandle } from '/@/components/FileSystem/Types'
import { IDisposable } from '/@/types/disposable'
import { iterateDir } from '/@/utils/iterateDir'

export const supportsCustomComponents = <const>['block', 'item', 'entity']
export type TComponentFileType = typeof supportsCustomComponents[number]
export class ComponentSchemas {
	protected schemas: Record<TComponentFileType, Record<string, unknown>> = {
		block: {},
		item: {},
		entity: {},
	}
	protected disposable?: IDisposable

	constructor() {}

	get(fileType: TComponentFileType) {
		return this.schemas[fileType]
	}

	async activate() {
		this.disposable = App.eventSystem.on(
			'fileSave',
			async ([filePath, _]: [string, File]) => {
				const app = await App.getApp()
				const project = app.project
				const componentPath = project.config.resolvePackPath(
					'behaviorPack',
					'components'
				)

				if (filePath.startsWith(componentPath)) {
					const fileType = filePath
						.replace(componentPath + '/', '')
						.split('/')[0] as TComponentFileType

					// We expect v1CompatMode to be true if the first folder name after the componentPath
					// doesn't match one of the file types which supports custom components
					await this.generateComponentSchemas(
						fileType,
						!supportsCustomComponents.includes(fileType)
					)
				}
			}
		)

		const app = await App.getApp()
		const project = app.project

		const v1CompatMode = project.config.get().bridge?.v1CompatMode ?? false
		if (v1CompatMode) this.generateComponentSchemas('entity', true)
		else
			await Promise.all(
				supportsCustomComponents.map((fileType) =>
					this.generateComponentSchemas(fileType)
				)
			)
	}

	dispose() {
		this.disposable?.dispose()
		this.disposable = undefined
	}

	async generateComponentSchemas(
		fileType: TComponentFileType,
		compatModeExpected = false
	) {
		const app = await App.getApp()
		const project = app.project
		await (await project.compilerService.completedStartUp).fired

		const v1CompatMode = project.config.get().bridge?.v1CompatMode ?? false
		if (!v1CompatMode && compatModeExpected) return

		const fromFilePath = v1CompatMode
			? project.config.resolvePackPath('behaviorPack', 'components')
			: project.config.resolvePackPath(
					'behaviorPack',
					`components/${fileType}`
			  )

		let baseDir: AnyDirectoryHandle
		try {
			baseDir = await app.fileSystem.getDirectoryHandle(fromFilePath)
		} catch {
			return {}
		}

		// Reset schemas
		this.schemas[fileType] = {}

		await iterateDir(
			baseDir,
			async (fileHandle, filePath) => {
				const [
					_,
					fileContent,
				] = await project.compilerService.compileFile(
					filePath,
					await fileHandle
						.getFile()
						.then(
							async (file) =>
								new Uint8Array(await file.arrayBuffer())
						)
				)
				const file = new File([fileContent], fileHandle.name)
				const component = new Component(
					new DefaultConsole(),
					fileType,
					await file.text(),
					'development',
					v1CompatMode
				)

				const loadedCorrectly = await component.load('client')

				if (loadedCorrectly && component.name)
					this.schemas[fileType][
						component.name
					] = component.getSchema()
			},
			undefined,
			fromFilePath
		)
	}
}
