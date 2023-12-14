import { data, fileSystem, projectManager } from '@/App'
import { basename, dirname, join } from '@/libs/path'
import { Runtime } from '@/libs/runtime/Runtime'

export class PresetData {
	public presets: { [key: string]: any } = {}
	public categories: { [key: string]: string[] } = {}

	private runtime = new Runtime()

	public async load() {
		this.presets = await data.get('packages/minecraftBedrock/presets.json')

		for (const [presetPath, preset] of Object.entries(this.presets)) {
			if (!this.categories[preset.category])
				this.categories[preset.category] = []

			this.categories[preset.category].push(presetPath)
		}
	}

	public getDefaultPresetOptions(presetPath: string) {
		const preset = this.presets[presetPath]

		const options: any = {}

		for (const [key, value] of Object.entries(preset.additionalModels)) {
			options[key] = value
		}

		return options
	}

	public async createPreset(presetPath: string, presetOptions: any) {
		const project = projectManager.currentProject

		if (!project) return

		if (
			!presetOptions.PRESET_PATH.endsWith('/') &&
			presetOptions.PRESET_PATH !== ''
		)
			presetOptions.PRESET_PATH += '/'

		const preset = this.presets[presetPath]

		const createFiles = preset.createFiles ?? []

		for (let createFileOptions of createFiles) {
			const isScript = typeof createFileOptions === 'string'

			if (isScript) {
				let templatePath = createFileOptions

				templatePath = join('packages/minecraftBedrock/', templatePath)

				const script = await data.getText(templatePath)

				const module: any = {}

				const result = await this.runtime.run(
					templatePath,
					{
						module,
					},
					script
				)

				module.exports({
					// We are just faking filehandles here since the file system doesn't necesarily use file handles
					createFile: async (
						path: string,
						handle: any,
						options: any
					) => {
						const packPath = project.packs[options.packPath]
						const filePath = join(packPath, path)

						await fileSystem.ensureDirectory(filePath)
						await fileSystem.writeFile(filePath, handle.content)
					},
					loadPresetFile: async (path: string) => {
						return {
							name: basename(path),
							content: await data.getRaw(
								join(
									dirname(
										presetPath.substring(
											'file:///data/'.length
										)
									),
									path
								)
							),
						}
					},
					models: presetOptions,
					expandFile: (path: string, content: any, options: any) =>
						console.log(
							'Trying to expand file',
							path,
							content,
							options
						),
				})

				continue
			}

			let [templatePath, targetPath, templateOptions] = createFileOptions

			templatePath = join(
				dirname(presetPath.substring('file:///data/'.length)),
				templatePath
			)

			let templateContent = await data.getText(templatePath)

			if (templateOptions.inject) {
				for (const inject of templateOptions.inject) {
					targetPath = targetPath.replace(
						'{{' + inject + '}}',
						presetOptions[inject]
					)
				}
			}

			targetPath = join(
				project.packs[templateOptions.packPath],
				targetPath
			)

			await fileSystem.ensureDirectory(targetPath)

			await fileSystem.writeFile(targetPath, templateContent)
		}
	}
}
