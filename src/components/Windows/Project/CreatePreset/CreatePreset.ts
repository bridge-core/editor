import {
	Sidebar,
	SidebarCategory,
	SidebarItem,
} from '@/components/Windows/Layout/Sidebar'
import CreatePresetComponent from './CreatePreset.vue'
import { BaseWindow } from '../../BaseWindow'
import { getFileSystem } from '@/utils/fs'
import { FileSystem } from '@/components/FileSystem/Main'
import { App } from '@/App'
import { v4 as uuid } from 'uuid'
import { dirname, extname } from 'path'
import { selectedProject } from '@/components/Project/Loader'
import { deepmerge } from '@/utils/deepmerge'
import { compare, CompareOperator } from 'compare-versions'
import { ProjectConfig } from '@/components/Project/ProjectConfig'
import { packIndexerReady } from '@/components/PackIndexer/PackIndexer'

export interface IPresetManifest {
	name: string
	icon: string
	category: string
	description?: string
	presetPath?: string
	targetVersion: [CompareOperator, string]
	fields: [string, string, IPresetFieldOpts][]
	createFiles?: [string, string, IPresetFileOpts?][]
	expandFiles?: [string, string, IPresetFileOpts?][]
}
interface IPresetFieldOpts {
	default?: string
}

interface IPresetFileOpts {
	inject: string[]
}

const textTransformFiles = [
	'.mcfunction',
	'.json',
	'.js',
	'.ts',
	'.txt',
	'.molang',
]
export class CreatePresetWindow extends BaseWindow {
	protected sidebar = new Sidebar([])
	protected packIndexerReady = packIndexerReady

	constructor() {
		super(CreatePresetComponent)
		this.defineWindow()
	}

	protected async addPreset(fs: FileSystem, manifestPath: string) {
		const app = await App.getApp()
		const manifest = <IPresetManifest>await fs.readJSON(manifestPath)
		// Presets need a category, presets without category are most likely incompatible v1 presets
		if (!manifest.category)
			throw new Error(
				`Error loading ${manifestPath}: Missing preset category`
			)

		// Load current project target version
		const projectTargetVersion =
			<string | undefined>(
				await app.projectConfig.get('projectTargetVersion')
			) ??
			(
				await app.fileSystem.readJSON(
					'data/packages/formatVersions.json'
				)
			).pop()
		if (
			manifest.targetVersion &&
			!compare(
				projectTargetVersion,
				manifest.targetVersion[1],
				manifest.targetVersion[0]
			)
		)
			return

		let category = <SidebarCategory | undefined>(
			this.sidebar.rawElements.find(
				element => element.getText() === manifest.category
			)
		)
		if (!category) {
			category = new SidebarCategory({
				text: manifest.category,
				items: [],
			})
			this.sidebar.addElement(category)
		}

		const id = uuid()
		category.addItem(
			new SidebarItem({
				id,
				text: manifest.name,
				icon: manifest.icon,
			})
		)
		this.sidebar.setState(id, {
			...manifest,
			presetPath: dirname(manifestPath),
			models: {
				PROJECT_PREFIX:
					(await app.projectConfig.get('projectPrefix')) ?? 'bridge',
				...Object.fromEntries(
					manifest.fields.map(([_, id, opts = {}]: any) => [
						id,
						opts.default ?? '',
					])
				),
			},
		})
	}

	protected async loadPresets(
		fs: FileSystem,
		dirPath = 'data/packages/preset'
	) {
		const dirents = await fs.readdir(dirPath, { withFileTypes: true })

		for (const dirent of dirents) {
			if (dirent.kind === 'directory')
				await this.loadPresets(fs, `${dirPath}/${dirent.name}`)
			else if (dirent.name === 'manifest.json')
				return await this.addPreset(fs, `${dirPath}/${dirent.name}`)
		}
	}

	async open() {
		const app = await App.getApp()
		app.windows.loadingWindow.open()
		this.sidebar.removeElements()

		const fs = await getFileSystem()
		await this.loadPresets(fs)

		app.windows.loadingWindow.close()
		super.open()
	}

	async createPreset({
		presetPath,
		createFiles = [],
		expandFiles = [],
	}: IPresetManifest) {
		if (!presetPath) return

		const app = await App.getApp()
		app.windows.loadingWindow.open()
		const fs = app.fileSystem

		const promises: Promise<unknown>[] = []
		const createdFiles: string[] = []
		promises.push(
			...createFiles.map(async ([originPath, destPath, opts]) => {
				const inject = opts?.inject ?? []
				const fullOriginPath = `${presetPath}/${originPath}`
				const fullDestPath = this.transformString(
					`projects/${selectedProject}/${destPath}`,
					inject
				)
				const ext = extname(fullDestPath)
				await fs.mkdir(dirname(fullDestPath), { recursive: true })
				createdFiles.push(this.transformString(destPath, inject))

				if (inject.length === 0 || !textTransformFiles.includes(ext)) {
					await fs.copyFile(fullOriginPath, fullDestPath)
				} else {
					const file = await fs.readFile(fullOriginPath)
					const fileText = await file.text()

					await fs.writeFile(
						fullDestPath,
						this.transformString(fileText, inject)
					)
				}
			}),
			...expandFiles.map(async ([originPath, destPath, opts]) => {
				const inject = opts?.inject ?? []
				const fullOriginPath = `${presetPath}/${originPath}`
				const fullDestPath = this.transformString(
					`projects/${selectedProject}/${destPath}`,
					inject
				)
				const ext = extname(fullDestPath)
				await fs.mkdir(dirname(fullDestPath), { recursive: true })
				createdFiles.push(this.transformString(destPath, inject))

				if (ext === '.json') {
					const json = await fs.readJSON(fullOriginPath)

					let destJson: any
					try {
						destJson = await fs.readJSON(fullDestPath)
					} catch {
						destJson = {}
					}

					await fs.writeFile(
						fullDestPath,
						this.transformString(
							JSON.stringify(
								deepmerge(destJson, json),
								null,
								'\t'
							),
							inject
						)
					)
				} else {
					const file = await fs.readFile(fullOriginPath)
					const fileText = await file.text()

					let destFileText: string
					try {
						destFileText = this.transformString(
							await (await fs.readFile(fullDestPath)).text(),
							inject
						)
					} catch {
						destFileText = ''
					}

					await fs.writeFile(
						fullDestPath,
						`${destFileText}${
							destFileText !== '' ? '\n' : ''
						}${fileText}`
					)
				}
			})
		)

		await Promise.all(promises)

		await new Promise<void>(resolve =>
			app.packIndexer.once(async () => {
				for (const filePath of createdFiles)
					await app.packIndexer.service.updateFile(filePath)

				resolve()
			})
		)

		app.windows.loadingWindow.close()
	}

	protected transformString(str: string, inject: string[]) {
		const models = this.sidebar.currentState.models
		inject.forEach(val => (str = str.replaceAll(`{{${val}}}`, models[val])))
		return str
	}
}
