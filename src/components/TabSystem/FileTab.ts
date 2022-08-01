import { Tab } from './CommonTab'
import { TabSystem } from './TabSystem'
import { v4 as uuid } from 'uuid'
import { AnyFileHandle } from '../FileSystem/Types'
import { VirtualFileHandle } from '../FileSystem/Virtual/FileHandle'
import { App } from '/@/App'
import {
	isUsingFileSystemPolyfill,
	isUsingSaveAsPolyfill,
} from '../FileSystem/Polyfill'
import { download } from '../FileSystem/saveOrDownload'
import { writableToUint8Array } from '/@/utils/file/writableToUint8Array'

export type TReadOnlyMode = 'forced' | 'manual' | 'off'

export abstract class FileTab extends Tab {
	public isForeignFile = false
	public isSaving = false

	constructor(
		protected parent: TabSystem,
		protected fileHandle: AnyFileHandle,
		public readOnlyMode: TReadOnlyMode = 'off'
	) {
		super(parent)
	}

	get isReadOnly() {
		return this.readOnlyMode !== 'off'
	}

	async setup() {
		this.isForeignFile = false
		if (
			this.fileHandle instanceof VirtualFileHandle &&
			this.fileHandle.getParent() === null
		)
			this.path = undefined
		else
			this.path = await this.parent.app.fileSystem.pathTo(this.fileHandle)

		// If the resolve above failed, we are dealing with a file which doesn't belong to this project
		if (!this.path || !this.parent.project.isFileWithinProject(this.path)) {
			await App.fileType.ready.fired

			this.isForeignFile = true

			let guessedFolder =
				(await App.fileType.guessFolder(this.fileHandle)) ?? uuid()
			if (!guessedFolder.endsWith('/')) guessedFolder += '/'

			this.path = `${guessedFolder}${uuid()}/${this.fileHandle.name}`
		}

		this.parent.project.packIndexer.once(async () => {
			const packIndexer = this.parent.project.packIndexer

			if (!(await packIndexer.hasFile(this.path!))) {
				await packIndexer.updateFile(
					this.path!,
					await this.getFile().then((file) => file.text()),
					this.isForeignFile
				)

				if (App.fileType.isJsonFile(this.getPath())) {
					this.parent.project.jsonDefaults.updateDynamicSchemas(
						this.getPath()
					)
				}
			}
		})

		await super.setup()
	}

	get name() {
		return this.fileHandle.name
	}
	getFileType() {
		return App.fileType.getId(this.getPath())
	}

	async is(tab: Tab): Promise<boolean> {
		if (!(tab instanceof FileTab)) return false

		return await this.isForFileHandle(tab.fileHandle)
	}
	async isForFileHandle(fileHandle: AnyFileHandle) {
		if (
			(<VirtualFileHandle>fileHandle).isVirtual !==
			(<VirtualFileHandle>this.fileHandle).isVirtual
		)
			return false

		// @ts-ignore This error can be ignored because of the check above
		return await fileHandle.isSameEntry(this.fileHandle)
	}

	getFile() {
		return this.fileHandle.getFile()
	}
	getFileHandle() {
		return this.fileHandle
	}

	abstract setReadOnly(readonly: TReadOnlyMode): Promise<void> | void

	async save() {
		if (this.isSaving) return
		this.isSaving = true
		// this.setReadOnly('forced')

		await this._save()

		this.isSaving = false
		// this.setReadOnly('off')
	}
	protected abstract _save(): void | Promise<void>
	async saveAs() {
		// Download the file if the user is using a file system polyfill
		if (isUsingSaveAsPolyfill) {
			const file = await this.fileHandle.getFile()

			download(
				this.fileHandle.name,
				new Uint8Array(await file.arrayBuffer())
			)
			return
		}

		const fileHandle = await self
			.showSaveFilePicker({
				// @ts-ignore The type package doesn't know about suggestedName yet
				suggestedName: this.fileHandle.name,
				// @ts-ignore The type package doesn't know about startIn yet
				startIn: this.fileHandle,
			})
			.catch(() => null)
		if (!fileHandle) return

		// Remove tab from openedFiles list
		if (!this.isForeignFile) this.parent.openedFiles.remove(this.getPath())

		this.fileHandle = fileHandle

		this.resetSignal()

		// After updating the file handle, we need to re-setup the tab
		await this.setup()
		await this.parent.save(this)

		// Add tab with new path to openedFiles list
		if (!this.isForeignFile) this.parent.openedFiles.add(this.getPath())
	}

	protected async writeFile(value: BufferSource | Blob | string) {
		// Current file handle is a virtual file without parent
		if (
			this.fileHandle instanceof VirtualFileHandle &&
			!this.fileHandle.hasParentContext
		) {
			// Download the file if the user is using a file system polyfill
			if (isUsingFileSystemPolyfill.value) {
				download(
					this.fileHandle.name,
					await writableToUint8Array(value)
				)
			}
			// Otherwise Prompt the user to choose a save location
			else {
				let fileHandle
				try {
					fileHandle = await window.showSaveFilePicker({
						suggestedName: this.fileHandle.name,
						// @ts-ignore The type package doesn't know about startIn yet
						startIn: this.parent.app.fileSystem.baseDirectory,
					})
				} catch {}

				if (!fileHandle) return false
				this.fileHandle = fileHandle
				this.resetSignal()

				// After updating the file handle, we need to re-setup the tab
				await this.setup()
			}

			// We're done here
			return true
		}

		return await this.parent.app.fileSystem
			.write(this.fileHandle, value)
			.then(() => true)
			.catch(() => false)
	}
}
