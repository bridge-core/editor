import { fileSystem } from '@/App'
import { basename, dirname, extname, join } from '@/libs/path'
import { ProjectManager } from '@/libs/project/ProjectManager'
import { Runtime } from '@/libs/runtime/Runtime'
import { compareVersions, deepMerge } from 'bridge-common-utils'
import { Ref, ref } from 'vue'
import { Data } from '@/libs/data/Data'

export class PresetData {
	public presets: { [key: string]: any } = {}
	public categories: { [key: string]: string[] } = {}

	private runtime = new Runtime(fileSystem)

	public async load() {
		this.presets = await Data.get('packages/minecraftBedrock/presets.json')

		for (const [presetPath, preset] of Object.entries(this.presets)) {
			if (!this.categories[preset.category]) this.categories[preset.category] = []

			this.categories[preset.category].push(presetPath)
		}
	}

	public getDefaultPresetOptions(presetPath: string) {
		const preset = this.presets[presetPath]

		const options: any = {}

		for (const [key, value] of Object.entries(preset.additionalModels)) {
			options[key] = value
		}

		for (const [name, key, fieldOptions] of preset.fields) {
			if (!fieldOptions.default) continue

			options[key] = fieldOptions.default
		}

		return options
	}

	public async createPreset(presetPath: string, presetOptions: any) {
		const project = ProjectManager.currentProject

		if (!project) return

		if (!presetOptions.PRESET_PATH.endsWith('/') && presetOptions.PRESET_PATH !== '')
			presetOptions.PRESET_PATH += '/'

		presetOptions.PROJECT_PREFIX = project.config?.namespace

		const preset = this.presets[presetPath]

		const createFiles = preset.createFiles ?? []

		for (let createFileOptions of createFiles) {
			const isScript = typeof createFileOptions === 'string'

			if (isScript) {
				let templatePath: string = createFileOptions

				if (templatePath.startsWith('presetScript/')) {
					templatePath = join(presetPath.substring('file:///data/'.length).split('/preset/')[0], templatePath)
				} else {
					templatePath = join(dirname(presetPath.substring('file:///data/'.length)), templatePath)
				}

				const script = await Data.getText(templatePath)

				const module: any = {}

				// For some reason if this script runs twice no module exports will exist unless we clear the cache
				this.runtime.clearCache()

				const result = await this.runtime.run(
					templatePath,
					{
						module,
					},
					script
				)

				module.exports({
					// We are just faking filehandles here since the file system doesn't necesarily use file handles
					createFile: async (path: string, handle: any | string, options: any) => {
						const packPath = project.packs[options.packPath]
						const filePath = join(packPath, path)

						await fileSystem.ensureDirectory(filePath)
						await fileSystem.writeFile(filePath, typeof handle === 'string' ? handle : handle.content)
					},
					createJSONFile: async (path: string, data: any, options: any) => {
						const packPath = project.packs[options.packPath]
						const filePath = join(packPath, path)

						await fileSystem.ensureDirectory(filePath)
						await fileSystem.writeFileJson(filePath, data, true)
					},
					expandFile: async (path: string, data: any, options: any) => {
						const packPath = project.packs[options.packPath]
						const filePath = join(packPath, path)

						await fileSystem.ensureDirectory(filePath)

						if (await fileSystem.exists(filePath)) {
							let existingContent = await fileSystem.readFileText(filePath)

							if (typeof data !== 'string') {
								await fileSystem.writeFile(
									filePath,
									JSON.stringify(deepMerge(JSON.parse(existingContent), JSON.parse(data)), null, '\t')
								)
							} else {
								await fileSystem.writeFile(filePath, `${existingContent}\n${data}`)
							}
						} else {
							await fileSystem.writeFile(
								filePath,
								typeof data === 'string' ? data : JSON.stringify(data, null, '\t')
							)
						}
					},
					loadPresetFile: async (path: string) => {
						return {
							name: basename(path),
							content: await Data.getRaw(
								join(dirname(presetPath.substring('file:///data/'.length)), path)
							),
							async text() {
								return await Data.getText(
									join(dirname(presetPath.substring('file:///data/'.length)), path)
								)
							},
						}
					},
					models: presetOptions,
				})

				continue
			}

			let [templatePath, targetPath, templateOptions] = createFileOptions

			templatePath = join(dirname(presetPath.substring('file:///data/'.length)), templatePath)

			let templateContent = null

			if (templatePath.endsWith('.png')) {
				templateContent = await Data.getRaw(templatePath)
			} else {
				templateContent = await Data.getText(templatePath)
			}

			if (templateOptions.inject) {
				for (const inject of templateOptions.inject) {
					targetPath = targetPath.replaceAll('{{' + inject + '}}', presetOptions[inject])

					if (typeof templateContent === 'string')
						templateContent = templateContent.replaceAll('{{' + inject + '}}', presetOptions[inject])
				}
			}

			targetPath = join(project.packs[templateOptions.packPath], targetPath)

			await fileSystem.ensureDirectory(targetPath)

			await fileSystem.writeFile(targetPath, templateContent)
		}

		const expandFiles = preset.expandFiles ?? []

		for (const expandFileOptions of expandFiles) {
			let [templatePath, targetPath, templateOptions] = expandFileOptions

			templatePath = join(dirname(presetPath.substring('file:///data/'.length)), templatePath)

			let templateContent = await Data.getText(templatePath)

			if (templateOptions.inject) {
				for (const inject of templateOptions.inject) {
					targetPath = targetPath.replaceAll('{{' + inject + '}}', presetOptions[inject])

					templateContent = templateContent.replaceAll('{{' + inject + '}}', presetOptions[inject])
				}
			}

			targetPath = join(project.packs[templateOptions.packPath], targetPath)

			await fileSystem.ensureDirectory(targetPath)

			if (await fileSystem.exists(targetPath)) {
				let existingContent = await fileSystem.readFileText(targetPath)

				if (extname(templatePath) === '.json') {
					await fileSystem.writeFile(
						targetPath,
						JSON.stringify(deepMerge(JSON.parse(existingContent), JSON.parse(templateContent)), null, '\t')
					)
				} else {
					await fileSystem.writeFile(targetPath, `${existingContent}\n${templateContent}`)
				}
			} else {
				await fileSystem.writeFile(targetPath, templateContent)
			}
		}
	}

	public getAvailablePresets() {
		return Object.fromEntries(
			Object.entries(this.presets).filter(([presetPath, preset]) => {
				if (!preset.requires) return true

				if (!ProjectManager.currentProject) return true

				if (preset.requires.packTypes) {
					for (const pack of preset.requires.packTypes) {
						if (!ProjectManager.currentProject.packs[pack]) return false
					}
				}

				if (preset.requires.targetVersion) {
					if (Array.isArray(preset.requires.targetVersion)) {
						if (
							!compareVersions(
								ProjectManager.currentProject.config?.targetVersion ?? '',
								preset.requires.targetVersion[1],
								preset.requires.targetVersion[0]
							)
						)
							return false
					} else {
						if (
							preset.requires.targetVersion.min &&
							!compareVersions(
								ProjectManager.currentProject.config?.targetVersion ?? '',
								preset.requires.targetVersion.min ?? '',
								'>='
							)
						)
							return false

						if (
							preset.requires.targetVersion.max &&
							!compareVersions(
								ProjectManager.currentProject.config?.targetVersion ?? '',
								preset.requires.targetVersion.max ?? '',
								'<='
							)
						)
							return false
					}
				}

				return true
			})
		)
	}

	public useAvailablePresets(): Ref<{ [key: string]: any }> {
		const availablePresets = ref(this.getAvailablePresets())

		return availablePresets
	}
}
