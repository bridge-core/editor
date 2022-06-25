import { Ref, ref } from '@vue/composition-api'
import { AnyDirectoryHandle, AnyFileHandle } from '../../FileSystem/Types'
import { BaseWrapper } from './BaseWrapper'
import { IDirectoryViewerOptions } from './DirectoryStore'
import { FileWrapper } from './FileWrapper'

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
		oldChildren.push(
			...newChildren.filter(
				(child) =>
					!oldChildren.some((currentChild) =>
						currentChild.isSame(child)
					)
			)
		)

		// Sort children
		this.sortChildren(oldChildren)

		this.children.value = oldChildren
	}
	sort() {
		if (this.children.value) this.sortChildren(this.children.value)
	}

	async toggleOpen() {
		// Folder is open, close it
		if (this.isOpen.value) {
			this.isOpen.value = false
			return
		}

		await this.open()
	}

	async open() {
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
	}

	protected _unselectAll() {
		this.isSelected.value = false
		this.children.value?.forEach((child) => {
			child.isSelected.value = false
			if (child.kind === 'directory') child._unselectAll()
		})
	}
	unselectAll() {
		if (this.parent === null) return this._unselectAll()
		this.parent.unselectAll()
	}

	onRightClick() {
		this.options.onFolderRightClick?.(this)
	}
}
