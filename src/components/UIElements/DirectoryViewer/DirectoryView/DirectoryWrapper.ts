import { Ref, ref } from '@vue/composition-api'
import { AnyDirectoryHandle } from '/@/components/FileSystem/Types'
import { BaseWrapper } from '../Common/BaseWrapper'
import { IDirectoryViewerOptions } from '../DirectoryStore'
import { FileWrapper } from '../FileView/FileWrapper'
import { showFolderContextMenu } from '../ContextMenu/Folder'

const ignoreFiles = ['.DS_Store']

export class DirectoryWrapper extends BaseWrapper<AnyDirectoryHandle> {
	public readonly kind = 'directory'
	public isOpen = ref(false)
	public isLoading = ref(false)
	public children = <Ref<(DirectoryWrapper | FileWrapper)[] | null>>ref(null)

	constructor(
		parent: DirectoryWrapper | null,
		directoryHandle: AnyDirectoryHandle,
		options: IDirectoryViewerOptions
	) {
		super(parent, directoryHandle, options)
	}

	get icon() {
		return this.isOpen.value ? 'mdi-folder-open' : 'mdi-folder'
	}

	protected async getChildren() {
		const children = []

		for await (const entry of this.handle.values()) {
			if (entry.kind === 'directory')
				children.push(new DirectoryWrapper(this, entry, this.options))
			else if (entry.kind === 'file' && !ignoreFiles.includes(entry.name))
				children.push(new FileWrapper(this, entry, this.options))
		}

		this.sortChildren(children)

		return children
	}
	protected sortChildren(children: (DirectoryWrapper | FileWrapper)[]) {
		return children.sort((a, b) => {
			if (a.kind === b.kind) return a.name.localeCompare(b.name)
			else if (a.kind === 'directory') return -1
			else if (b.kind === 'directory') return 1

			return 0
		})
	}

	/**
	 * Load directory contents
	 */
	async load() {
		if (this.children.value) {
			console.warn(`Children are already loaded`)
			return
		}

		this.children.value = await this.getChildren()
	}

	async refresh() {
		const oldChildren = this.children.value ?? []
		const newChildren = await this.getChildren()

		for (let i = 0; i < oldChildren.length; i++) {
			const currentChild = oldChildren[i]

			if (newChildren.some((child) => child.isSame(currentChild))) {
				// Refresh folders which still exist
				if (currentChild.kind === 'directory')
					await currentChild.refresh()
			} else {
				// Remove deleted folders/files
				oldChildren.splice(i, 1)
			}
		}

		// Add newly added files & folders
		const newlyAdded = newChildren.filter(
			(child) =>
				!oldChildren.some((currentChild) =>
					currentChild.isSame(child)
				)
		)
		oldChildren.push(
			...newlyAdded
		)

		// Sort children
		this.sortChildren(oldChildren)

		this.children.value = oldChildren
	}
	sort() {
		if (this.children.value) this.sortChildren(this.children.value)
	}

	async toggleOpen(deep = false) {
		// Folder is open, close it
		if (this.isOpen.value)  this.close(deep)
		else await this.open(deep)
	}

	async close(deep=false) {
		this.isOpen.value = false

		if (deep) {
			this.children.value?.forEach((child) => {
				if(child instanceof DirectoryWrapper)
					child.close(true)
			})
		}
	}
	async open(deep=false) {
		// Folder is closed, did we load folder contents already?
		if (this.children.value) {
			// Yes, open folder
			this.isOpen.value = true
		} else {
			// No, load folder contents
			this.isLoading.value = true

			await this.load()
			this.isOpen.value = true
			this.isLoading.value = false
		}

		if(deep) {
			this.children.value?.forEach((child) => {
				if(child instanceof DirectoryWrapper)
					child.open(true)
			})
		}
	}

	protected _unselectAll() {
		this.isSelected.value = false
		this.children.value?.forEach((child) => {
			child.isSelected.value = false
			if (child.kind === 'directory') child._unselectAll()
		})
	}
	override unselectAll() {
		if (this.parent === null) return this._unselectAll()
		this.parent.unselectAll()
	}

	override _onRightClick(event: MouseEvent) {
		showFolderContextMenu(event, this)
		this.options.onDirectoryRightClick?.(event, this)
	}
	override _onClick(_: MouseEvent, forceClick: boolean): void {
		// Click is a double click so we want to deep open/close the folder
		if(forceClick) {
			if(this.isOpen.value) this.open(true)
			else this.close(true)
		} else {
			// Normal click; toggle folder open/close
			this.toggleOpen(forceClick)
		}
	}
}
