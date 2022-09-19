import type { DirectoryWrapper } from '../DirectoryView/DirectoryWrapper'
import { VirtualHandle } from '/@/components/FileSystem/Virtual/Handle'
import { App } from '/@/App'
import type { IDirectoryViewerOptions } from '../DirectoryStore'
import { moveHandle } from '/@/utils/file/moveHandle'
import { ref } from 'vue'
import type { FileWrapper } from '../FileView/FileWrapper'
import { platform } from '/@/utils/os'
import { renameHandle } from '/@/utils/file/renameHandle'
import { isSameEntry } from '/@/utils/file/isSameEntry'

export abstract class BaseWrapper<T extends FileSystemHandle | VirtualHandle> {
	public abstract readonly kind: 'file' | 'directory'
	public readonly isSelected = ref(false)
	public readonly isEditingName = ref(false)

	constructor(
		protected parent: DirectoryWrapper | null,
		public readonly handle: T,
		public readonly options: IDirectoryViewerOptions
	) {}

	get name() {
		return this.handle.name === ''
			? this.options.startPath ?? ''
			: this.handle.name
	}
	get path(): string | null {
		if (!this.parent) return this.options.startPath ?? null

		const parentPath = this.parent.path

		if (!parentPath) return this.name
		else return `${parentPath}/${this.name}`
	}
	get color() {
		const path = this.path
		if (!path) return this.options.defaultIconColor ?? 'accent'

		return (
			App.packType.get(path)?.color ??
			this.options.defaultIconColor ??
			'accent'
		)
	}
	getParent() {
		return this.parent
	}

	async isSame(child: BaseWrapper<any>) {
		return await isSameEntry(child.handle, this.handle)
	}

	abstract readonly icon: string
	abstract unselectAll(): void
	abstract _onRightClick(
		event: MouseEvent,
		baseWrapper: BaseWrapper<any>
	): void
	abstract _onClick(event: MouseEvent, forceClick: boolean): void

	onRightClick(event: MouseEvent, baseWrapper: BaseWrapper<any>) {
		this._onRightClick(event, baseWrapper)

		this.unselectAll()
		this.isSelected.value = true
	}
	onClick(event: MouseEvent, forceClick: boolean = false) {
		this._onClick(event, forceClick)

		// Unselect other wrappers if multiselect key is not pressed
		if (
			(platform() === 'darwin' && !event.metaKey) ||
			(platform() !== 'darwin' && !event.ctrlKey)
		)
			this.unselectAll()

		this.isSelected.value = true

		// Find first wrapper name component and focus it
		const nameElement = <HTMLElement>(
			event
				.composedPath()
				.find((el) =>
					(<HTMLElement>el).classList.contains(
						'directory-viewer-name'
					)
				)
		)
		if (nameElement) nameElement.focus()
	}

	async move(directoryWrapper: DirectoryWrapper) {
		// No move actually happened
		if (this.parent === directoryWrapper) return

		// Store old path and old parent handle
		const fromPath = this.path!
		const fromParent = this.parent!

		// Set the new parent
		this.parent = directoryWrapper

		// Move the file handle
		const { type, handle: newHandle } = await moveHandle({
			fromHandle: fromParent.handle,
			toHandle: this.parent.handle,
			moveHandle: this.handle,
		})

		if (newHandle) {
			// If necessary, update the handle reference
			// @ts-ignore This works because newHandle always has the same type as this.handle
			this.handle = newHandle
		}

		if (type === 'cancel') {
			// Move was cancelled
			this.parent = fromParent
			directoryWrapper.children.value =
				directoryWrapper.children.value!.filter(
					(child) =>
						child !==
						<DirectoryWrapper | FileWrapper>(<unknown>this)
				)
			fromParent.children.value!.push(
				<DirectoryWrapper | FileWrapper>(<unknown>this)
			)
			fromParent.sort()
		} else if (type === 'overwrite') {
			// We need to remove the duplicate FileWrapper
			directoryWrapper.children.value =
				directoryWrapper.children.value!.filter(
					(child) =>
						child ===
							<DirectoryWrapper | FileWrapper>(<unknown>this) ||
						!child.isSame(
							<DirectoryWrapper | FileWrapper>(<unknown>this)
						)
				)
		}

		// Call onHandleMoved
		this.options.onHandleMoved?.({
			movedHandle: this.handle,
			fromHandle: this.parent.handle,
			fromPath,
			toPath: this.path!,
			toHandle: this.parent.handle,
		})

		// Sort parent's children
		directoryWrapper.sort()
	}
	async rename(newName: string) {
		// No rename actually happened
		if (this.name === newName) return

		// Store old path and old parent handle
		const fromPath = this.path!
		const fromParent = this.parent!

		// Rename the file handle
		const { type, handle: newHandle } = await renameHandle({
			parentHandle: fromParent.handle,
			renameHandle: this.handle,
			newName,
		})

		if (newHandle) {
			// If necessary, update the handle reference
			// @ts-ignore This works because newHandle always has the same type as this.handle
			this.handle = newHandle
		}

		if (type === 'cancel') return

		if (type === 'overwrite') {
			// We need to remove the duplicate FileWrapper
			this.getParent()!.children.value =
				this.getParent()!.children.value!.filter(
					(child) =>
						child ===
							<DirectoryWrapper | FileWrapper>(<unknown>this) ||
						!child.isSame(
							<DirectoryWrapper | FileWrapper>(<unknown>this)
						)
				)
		}

		// Call onHandleMoved
		this.options.onHandleMoved?.({
			movedHandle: this.handle,
			fromHandle: fromParent.handle,
			fromPath,
			toPath: this.path!,
			toHandle: this.parent!.handle,
		})

		await this.parent!.refresh()
	}

	startRename() {
		if (this.options.isReadOnly || this.parent === null) return

		this.isEditingName.value = true
	}
	async confirmRename(newName: string) {
		if (!newName) return

		this.isEditingName.value = false

		await this.rename(newName)
	}

	async onFilesAdded(filePaths: string[]) {
		await this.options.onFilesAdded?.(filePaths)
	}
}
