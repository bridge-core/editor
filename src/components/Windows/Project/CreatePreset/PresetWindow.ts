import { Sidebar, SidebarCategory } from '/@/components/Windows/Layout/Sidebar'
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
import { getLatestFormatVersion } from '/@/components/Data/FormatVersions'
import { PresetItem } from './PresetItem'
import { DataLoader } from '/@/components/Data/DataLoader'
import { VirtualHandle } from '../../../Data/VirtualFs/Handle'

export interface IPresetManifest {
	name: string
	icon: string
	requiredModules?: string[]
	packTypes?: TPackTypeId[]
	category: string
	description?: string
	presetPath?: string
	targetVersion: [CompareOperator, string]
	additionalModels?: Record<string, unknown>
	fields: [string, string, IPresetFieldOpts][]
	createFiles?: (string | TCreateFile)[]
	expandFiles?: TExpandFile[]
}
export interface IPresetFieldOpts {
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

export interface IPermissions {
	mayOverwriteFiles?: boolean
	mayOverwriteUnsavedChanges?: boolean
}

export class CreatePresetWindow extends BaseWindow {
	protected loadPresetPaths = new Map<string, string>()
	protected sidebar = new Sidebar([])
	/**
	 * Add new validation strategies to this object ([key]: [validationFunction])
	 * to make them available as the [key] inside of presets.
	 */
	protected _validationRules: Record<string, (value: string) => boolean> = {
		alphanumeric: (value: string) =>
			value.match(/^[a-zA-Z0-9_\.]*$/) !== null,
		lowercase: (value: string) => value.toLowerCase() === value,
		required: (value: string) => !!value,
	}

	/**
	 * This getter returns the validationRules object for usage inside of the PresetWindow.
	 * It wraps the _validationRules (see above) functions inside of another function call to return the proper
	 * error message: "windows.createPreset.validationRule.[key]"
	 */
	get validationRules() {
		return Object.fromEntries(
			Object.entries(this._validationRules).map(([key, func]) => [
				key,
				(value: string) =>
					func(value) ||
					App.instance.locales.translate(
						`windows.createPreset.validationRule.${key}`
					),
			])
		)
	}

	constructor() {
		super(PresetWindowComponent)
		this.defineWindow()
	}

	protected async addPreset(
		fs: FileSystem | DataLoader,
		manifestPath: string
	) {
		const app = await App.getApp()
		const manifest = <IPresetManifest>await fs.readJSON(manifestPath)

		// Presets need a category, presets without category are most likely incompatible v1 presets
		if (!manifest.category)
			throw new Error(
				`Error loading ${manifestPath}: Missing preset category`
			)

		// Check that project has packType preset needs
		if (!app.project?.hasPacks(manifest.packTypes ?? [])) return

		// Check that the project has the required modules
		if (manifest.requiredModules) {
			const gameTest = <boolean | undefined>(
				app.projectConfig.get().capabilities?.includes('gameTestAPI')
			)
			const scripting = <boolean | undefined>(
				app.projectConfig.get().capabilities?.includes('scriptingAPI')
			)

			for (const module of manifest.requiredModules) {
				if (module == 'gameTest' && !gameTest) return
				if (module == 'scriping' && !scripting) return
			}
		}

		// Load current project target version
		const projectTargetVersion =
			app.projectConfig.get().targetVersion ??
			(await getLatestFormatVersion())
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
				isOpen: false,
				text: manifest.category,
				items: [],
			})
			this.sidebar.addElement(category)
		}

		const id = uuid()

		const resetState = () => {
			this.sidebar.setState(id, {
				...manifest,
				presetPath: dirname(manifestPath),
				models: {
					PROJECT_PREFIX:
						app.projectConfig.get().namespace ?? 'bridge',
					...(manifest.additionalModels ?? {}),
					...Object.fromEntries(
						manifest.fields.map(([_, id, opts = {}]: any) => [
							id,
							opts.default ??
								(!opts.type || opts.type === 'textInput'
									? ''
									: null),
						])
					),
				},
			})
		}

		category.addItem(
			new PresetItem({
				id,
				text: manifest.name,
				icon: manifest.icon,
				color: 'primary',
				resetState,
			})
		)

		resetState()
	}

	protected async loadPresets(
		fs: FileSystem | DataLoader,
		dirPath = 'data/packages/minecraftBedrock/preset'
	) {
		let dirents: (FileSystemHandle | VirtualHandle)[] = []
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

		await this.loadPresets(app.dataLoader)
		for (const [_, loadPresetPath] of this.loadPresetPaths)
			await this.loadPresets(fs, loadPresetPath)

		this.sidebar.setDefaultSelected()
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
		const createdFiles: FileSystemFileHandle[] = []
		const permissions: IPermissions = {
			mayOverwriteFiles: undefined,
			mayOverwriteUnsavedChanges: undefined,
		}

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
					permissions.mayOverwriteFiles = true
					break
				} else {
					// Close loading window & early return
					app.windows.loadingWindow.close()
					return
				}
			}
		}

		const project = app.project!
		// Request permission for overwriting unsaved changes
		for (const expandFile of expandFiles) {
			if (typeof expandFile === 'string') continue

			let filePath = transformString(
				expandFile[1],
				expandFile[2]?.inject ?? [],
				this.sidebar.currentState.models
			)
			// This filePath is relative to the project root
			// The project.hasFile/project.closeFile methods expect the path to relative to the bridge project folder
			const fileHandle = await project.fileSystem.getFileHandle(filePath)

			const tab = await project.getFileTab(fileHandle)
			if (tab !== undefined && tab.isUnsaved) {
				const confirmWindow = new ConfirmationWindow({
					description: 'windows.createPreset.overwriteUnsavedChanges',
					confirmText:
						'windows.createPreset.overwriteUnsavedChangesConfirm',
				})

				const overwriteUnsaved = await confirmWindow.fired
				if (overwriteUnsaved) {
					// Stop file collision checks & continue creating preset
					permissions.mayOverwriteUnsavedChanges = true

					project.closeFile(fileHandle)
				} else {
					// Close loading window & early return
					app.windows.loadingWindow.close()
					return
				}
			}
		}

		promises.push(
			...createFiles.map(async (createFileOpts) => {
				if (typeof createFileOpts === 'string') {
					createdFiles.push(
						...(await runPresetScript(
							presetPath,
							createFileOpts,
							this.sidebar.currentState.models,
							permissions
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
		App.eventSystem.dispatch('fileAdded', undefined)

		// Close window
		if (permissions.mayOverwriteFiles !== false) this.close()

		const filePaths: string[] = []
		for (const fileHandle of createdFiles) {
			const filePath = await app.project.getProjectPath(fileHandle)
			if (!filePath) continue

			filePaths.push(filePath)

			await app.project.openFile(
				fileHandle,
				fileHandle === createdFiles[createdFiles.length - 1]
			)
		}

		await app.project.updateFiles(filePaths)

		// Reset preset inputs
		if (this.sidebar.currentElement instanceof PresetItem)
			this.sidebar.currentElement.resetState()

		app.windows.loadingWindow.close()
	}
}
