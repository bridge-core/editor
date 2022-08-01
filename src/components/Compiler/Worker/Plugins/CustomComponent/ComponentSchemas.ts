import { Component, DefaultConsole } from 'dash-compiler'
import { App } from '/@/App'
import { JsRuntime } from '/@/components/Extensions/Scripts/JsRuntime'
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
	protected schemaLookup = new Map<string, [TComponentFileType, string]>()
	protected disposables?: IDisposable[]

	constructor() {}

	get(fileType: TComponentFileType) {
		return this.schemas[fileType]
	}

	async activate() {
		this.disposables = [
			App.eventSystem.on(
				'fileSave',
				async ([filePath, file]: [string, File]) => {
					const app = await App.getApp()
					const project = app.project

					const componentPath = project.config.resolvePackPath(
						'behaviorPack',
						'components'
					)

					const v1CompatMode =
						project.config.get().bridge?.v1CompatMode ?? false

					if (!filePath.startsWith(componentPath)) return
					const jsRuntime = new JsRuntime()

					const fileType = filePath
						.replace(componentPath + '/', '')
						.split('/')[0] as TComponentFileType
					const isSupportedFileType = supportsCustomComponents.includes(
						fileType
					)

					if (!isSupportedFileType && v1CompatMode) {
						// This is not a supported file type but v1CompatMode is enabled,
						// meaning that we emulate v1's behavior where components could be placed anywhere
						await Promise.all(
							supportsCustomComponents.map((fileType) =>
								this.evalComponentSchema(
									jsRuntime,
									fileType,
									filePath,
									file,
									true
								)
							)
						)
					} else if (isSupportedFileType) {
						// No v1CompatMode but a valid file type which supports custom components to work with
						await this.evalComponentSchema(
							jsRuntime,
							fileType,
							filePath,
							file,
							v1CompatMode
						)
					}
				}
			),
			App.eventSystem.on('fileUnlinked', (filePath: string) => {
				const [fileType, componentName] =
					this.schemaLookup.get(filePath) ?? []
				if (!fileType || !componentName) return

				this.schemas[fileType][componentName] = undefined
				this.schemaLookup.delete(filePath)
			}),
		]

		const jsRuntime = new JsRuntime()

		await Promise.all(
			supportsCustomComponents.map((fileType) =>
				this.generateComponentSchemas(jsRuntime, fileType)
			)
		)
	}

	dispose() {
		this.disposables?.forEach((disposable) => disposable.dispose())
		this.disposables = undefined
	}

	protected async generateComponentSchemas(
		jsRuntime: JsRuntime,
		fileType: TComponentFileType
	) {
		const app = await App.getApp()
		const project = app.project
		await (await project.compilerService.completedStartUp).fired

		const v1CompatMode = project.config.get().bridge?.v1CompatMode ?? false

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
				await this.evalComponentSchema(
					jsRuntime,
					fileType,
					filePath,
					await fileHandle.getFile(),
					v1CompatMode
				)
			},
			undefined,
			fromFilePath
		)
	}

	protected async evalComponentSchema(
		jsRuntime: JsRuntime,
		fileType: TComponentFileType,
		filePath: string,
		file: File,
		v1CompatMode: boolean
	) {
		const app = await App.getApp()
		const project = app.project
		await (await project.compilerService.completedStartUp).fired

		const [_, fileContent] = await project.compilerService.compileFile(
			filePath,
			new Uint8Array(await file.arrayBuffer())
		)
		const transformedFile = new File([fileContent], file.name)
		const component = new Component(
			new DefaultConsole(),
			fileType,
			await transformedFile.text(),
			'development',
			v1CompatMode
		)

		const loadedCorrectly = await component.load(
			jsRuntime,
			filePath,
			'client'
		)

		if (loadedCorrectly && component.name) {
			this.schemas[fileType][component.name] = component.getSchema()
			this.schemaLookup.set(filePath, [fileType, component.name])
		}
	}
}
