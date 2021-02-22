import {
	Sidebar,
	SidebarCategory,
	SidebarItem,
} from '/@/components/Windows/Layout/Sidebar'
import PresetWindowComponent from './PresetWindow.vue'
import { BaseWindow } from '../../BaseWindow'
import { FileSystem } from '/@/components/FileSystem/FileSystem'
import { App } from '/@/App'
import { v4 as uuid } from 'uuid'
import { dirname } from '/@/utils/path'
import { compare, CompareOperator } from 'compare-versions'
import { runPresetScript } from './PresetScript'
import { expandFile, TExpandFile } from './ExpandFile'
import { createFile, TCreateFile } from './CreateFile'
import { TPackTypeId } from '/@/components/Data/PackType'
import { transformString } from './TransformString'
import { ConfirmationWindow } from '../../Common/Confirm/ConfirmWindow'

export interface IPresetManifest {
	name: string
	icon: string
	packTypes?: TPackTypeId[]
	category: string
	description?: string
	presetPath?: string
	targetVersion: [CompareOperator, string]
	fields: [string, string, IPresetFieldOpts][]
	createFiles?: (string | TCreateFile)[]
	expandFiles?: TExpandFile[]
}
interface IPresetFieldOpts {
	// All types
	type?: 'fileInput' | 'numberInput' | 'textInput' | 'switch'
	default?: string
	optional?: boolean
	// Type = 'numberInput'
	min?: number
	max?: number
	step?: number
	// type = 'fileInput'
	accept: string
	icon: string
}

export interface IPresetFileOpts {
	inject: string[]
}

export class CreatePresetWindow extends BaseWindow {
	protected loadPresetPaths = new Map<string, string>()
	protected sidebar = new Sidebar([])

	constructor() {
		super(PresetWindowComponent)
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

		// Check that project has packType preset needs
		if (!app.project?.hasPacks(manifest.packTypes ?? [])) return

		// Load current project target version
		const projectTargetVersion =
			<string | undefined>await app.projectConfig.get('targetVersion') ??
			(
				await app.fileSystem.readJSON(
					'data/packages/formatVersions.json'
				)
			).pop()
		// Check that preset is supported on target version
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
				(element) => element.getText() === manifest.category
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
				color: 'primary',
			})
		)
		this.sidebar.setState(id, {
			...manifest,
			presetPath: dirname(manifestPath),
			models: {
				PROJECT_PREFIX:
					(await app.projectConfig.get('prefix')) ?? 'bridge',
				...Object.fromEntries(
					manifest.fields.map(([_, id, opts = {}]: any) => [
						id,
						opts.default ?? null,
					])
				),
			},
		})
	}

	protected async loadPresets(
		fs: FileSystem,
		dirPath = 'data/packages/preset'
	) {
		let dirents: FileSystemHandle[] = []
		try {
			dirents = await fs.readdir(dirPath, { withFileTypes: true })
		} catch {}

		for (const dirent of dirents) {
			if (dirent.kind === 'directory')
				await this.loadPresets(fs, `${dirPath}/${dirent.name}`)
			else if (dirent.name === 'manifest.json')
				return await this.addPreset(fs, `${dirPath}/${dirent.name}`)
		}
	}

	async open() {
		const app = await App.getApp()
		const fs = app.fileSystem
		app.windows.loadingWindow.open()
		this.sidebar.removeElements()

		await this.loadPresets(fs)
		for (const [_, loadPresetPath] of this.loadPresetPaths)
			await this.loadPresets(fs, loadPresetPath)

		app.windows.loadingWindow.close()
		super.open()
	}
	addPresets(folderPath: string) {
		const id = uuid()
		this.loadPresetPaths.set(id, folderPath)

		return {
			dispose: () => this.loadPresetPaths.delete(id),
		}
	}

	async createPreset({
		presetPath,
		createFiles = [],
		expandFiles = [],
	}: IPresetManifest) {
		if (!presetPath) return

		const app = await App.getApp()
		app.windows.loadingWindow.open()
		const fs = app.project?.fileSystem!

		const promises: Promise<unknown>[] = []
		const createdFiles: string[] = []

		// Check that we don't overwrite files
		for (const createFile of createFiles) {
			if (typeof createFile === 'string') continue

			const filePath = transformString(
				createFile[1],
				createFile[2]?.inject ?? [],
				this.sidebar.currentState.models
			)
			if (await fs.fileExists(filePath)) {
				const confirmWindow = new ConfirmationWindow({
					description: 'windows.createPreset.overwriteFiles',
					confirmText: 'windows.createPreset.overwriteFilesConfirm',
				})

				const overwriteFiles = await confirmWindow.fired
				if (overwriteFiles) {
					// Stop file collision checks & continue creating preset
					break
				} else {
					// Close loading window & early return
					app.windows.loadingWindow.close()
					return
				}
			}
		}

		// Close window
		this.close()

		promises.push(
			...createFiles.map(async (createFileOpts) => {
				if (typeof createFileOpts === 'string') {
					createdFiles.push(
						...(await runPresetScript(
							presetPath,
							createFileOpts,
							this.sidebar.currentState.models
						))
					)
				} else {
					createdFiles.push(
						await createFile(
							presetPath,
							createFileOpts,
							this.sidebar.currentState.models
						)
					)
				}
			}),
			...expandFiles.map(async (expandFileOpts) => {
				createdFiles.push(
					await expandFile(
						presetPath,
						expandFileOpts,
						this.sidebar.currentState.models
					)
				)
			})
		)

		await Promise.all(promises)

		for (const filePath of createdFiles) {
			app.project?.updateFile(filePath)
			app.project?.openFile(`projects/${app.project.name}/${filePath}`)
		}

		app.windows.loadingWindow.close()
	}
}
