import { Sidebar, SidebarCategory } from '/@/components/Windows/Layout/Sidebar'
import PresetWindowComponent from './PresetWindow.vue'
import { BaseWindow } from '../../BaseWindow'
import { FileSystem } from '/@/components/FileSystem/FileSystem'
import { App } from '/@/App'
import { v4 as uuid } from 'uuid'
import { dirname } from '/@/utils/path'
import { runPresetScript } from './PresetScript'
import { expandFile, TExpandFile } from './ExpandFile'
import { createFile, TCreateFile } from './CreateFile'
import { PackType } from '/@/components/Data/PackType'
import { transformString } from './TransformString'
import { ConfirmationWindow } from '../../Common/Confirm/ConfirmWindow'
import { PresetItem } from './PresetItem'
import { DataLoader } from '/@/components/Data/DataLoader'
import { AnyFileHandle, AnyHandle } from '/@/components/FileSystem/Types'
import {
	IRequirements,
	RequiresMatcher,
} from '/@/components/Data/RequiresMatcher'

export interface IPresetManifest {
	name: string
	icon: string
	requiredModules?: string[]
	category: string
	description?: string
	presetPath?: string
	additionalModels?: Record<string, unknown>
	fields: [string, string, IPresetFieldOpts][]
	createFiles?: (string | TCreateFile)[]
	expandFiles?: TExpandFile[]
	requires: IRequirements
}
export interface IPresetFieldOpts {
	// All types
	type?: 'fileInput' | 'numberInput' | 'textInput' | 'switch' | 'selectInput'
	default?: string
	optional?: boolean
	// Type = 'numberInput'
	min?: number
	max?: number
	step?: number
	// type = 'fileInput'
	accept?: string
	icon?: string
	multiple?: boolean
	// type = 'selectInput'
	options?: string[] | { fileType: string; cacheKey: string }
	isLoading?: boolean
}

export interface IPresetFileOpts {
	inject: string[]
	openFile?: boolean
}

export interface IPermissions {
	mayOverwriteFiles?: boolean
	mayOverwriteUnsavedChanges?: boolean
}

export class CreatePresetWindow extends BaseWindow {
	protected loadPresetPaths = new Map<string, string>()
	protected sidebar = new Sidebar([])
	protected shouldReloadPresets = true
	protected modelResetters: (() => void)[] = []

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

		App.eventSystem.on('presetsChanged', () => {
			this.onPresetsChanged()
		})
	}

	onPresetsChanged() {
		this.shouldReloadPresets = true
	}

	protected async addPreset(
		fs: FileSystem | DataLoader,
		manifestPath: string
	) {
		const app = await App.getApp()
		// Load manifest
		let manifest: IPresetManifest
		try {
			manifest = <IPresetManifest>await fs.readJSON(manifestPath)
		} catch (err) {
			return
		}

		// Presets need a category, presets without category are most likely incompatible v1 presets
		if (!manifest.category)
			throw new Error(
				`Error loading ${manifestPath}: Missing preset category`
			)

		const requiresMatcher = new RequiresMatcher(manifest.requires)
		if (!(await requiresMatcher.isValid())) return

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
			manifest.fields?.forEach(
				([fieldName, fieldModel, fieldOpts = {}]) => {
					if (
						fieldOpts.type !== 'selectInput' ||
						Array.isArray(fieldOpts.options)
					)
						return

					const { fileType, cacheKey } = fieldOpts.options ?? {}
					if (!fileType || !cacheKey) return

					fieldOpts.options = []
					fieldOpts.isLoading = true
					app.project.packIndexer.once(async () => {
						const options = await app.project.packIndexer.service.getCacheDataFor(
							fileType,
							undefined,
							cacheKey
						)

						fieldOpts.options = options ?? []
						fieldOpts.isLoading = false
					})
				}
			)

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

		const presetPath = manifest.additionalModels?.PRESET_PATH
		const iconColor =
			typeof presetPath === 'string' &&
			manifest.category === 'fileType.simpleFile'
				? PackType.getWithRelativePath(presetPath + 'test.json')
						?.color ?? 'primary'
				: 'primary'

		category.addItem(
			new PresetItem({
				id,
				text: manifest.name,
				icon: manifest.icon,
				color: iconColor,
				resetState,
			})
		)

		resetState()
		this.modelResetters.push(resetState)
	}

	protected async loadPresets(
		fs: FileSystem | DataLoader,
		dirPath = 'data/packages/minecraftBedrock/preset'
	) {
		await fs.fired

		let dirents: AnyHandle[] = []
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

		if (this.shouldReloadPresets) {
			this.sidebar.removeElements()

			await this.loadPresets(app.dataLoader)
			for (const [_, loadPresetPath] of this.loadPresetPaths)
				await this.loadPresets(fs, loadPresetPath)

			this.sidebar.setDefaultSelected()
			this.shouldReloadPresets = false
		} else {
			this.modelResetters.forEach((reset) => reset())
		}

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
		const fs = app.project!.fileSystem

		const createdFiles: AnyFileHandle[] = []
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
			// The project.hasFile/project.closeFile methods expect a fileHandle
			let fileHandle: AnyFileHandle | null = null
			try {
				fileHandle = await project.fileSystem.getFileHandle(filePath)
			} catch {
				continue
			}

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

		const openFiles: AnyFileHandle[] = []
		for (const createFileOpts of createFiles) {
			if (typeof createFileOpts === 'string') {
				const scriptResult = await runPresetScript(
					presetPath,
					createFileOpts,
					this.sidebar.currentState.models,
					permissions
				)
				createdFiles.push(...scriptResult.createdFiles)
				openFiles.push(...scriptResult.openFile)
			} else {
				const fileHandle = await createFile(
					presetPath,
					createFileOpts,
					this.sidebar.currentState.models
				)
				createdFiles.push(fileHandle)
				if (createFileOpts[2]?.openFile) openFiles.push(fileHandle)
			}
		}
		for (const expandFileOpts of expandFiles) {
			const fileHandle = await expandFile(
				presetPath,
				expandFileOpts,
				this.sidebar.currentState.models
			)
			createdFiles.push(fileHandle)
			if (expandFileOpts[2]?.openFile) openFiles.push(fileHandle)
		}

		// await Promise.all(promises)
		App.eventSystem.dispatch('fileAdded', undefined)

		// Close window
		if (permissions.mayOverwriteFiles !== false) this.close()

		const filePaths: string[] = []
		for (const fileHandle of createdFiles) {
			const filePath = await app.project.getProjectPath(fileHandle)
			if (!filePath) continue

			filePaths.push(filePath)
			if (openFiles.includes(fileHandle))
				await app.project.openFile(fileHandle, {
					selectTab: fileHandle === openFiles[openFiles.length - 1],
					isTemporary: false,
				})
		}

		await app.project.updateFiles(filePaths)

		// Reset preset inputs
		if (this.sidebar.currentElement instanceof PresetItem)
			this.sidebar.currentElement.resetState()

		app.windows.loadingWindow.close()
	}
}
