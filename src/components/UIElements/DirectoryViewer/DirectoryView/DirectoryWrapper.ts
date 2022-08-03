import { markRaw, Ref, ref } from 'vue'
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
		const children: (DirectoryWrapper | FileWrapper)[] = []

		try {
			for await (const entry of this.handle.values()) {
				if (entry.kind === 'directory')
					children.push(markRaw((new DirectoryWrapper(this, entry, this.options))))
				else if (entry.kind === 'file' && !ignoreFiles.includes(entry.name))
					children.push(markRaw(new FileWrapper(this, entry, this.options)))
			}
		} catch(err) {
			console.error("Trying to access non-existent directory", this.path)
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
	protected getOpenFolders(currentPath: string[] = []) {
		const openFolders: string[][] = []

		if (this.isOpen.value && currentPath.length !== 0) {
			openFolders.push(currentPath)
		}

		if (this.children.value) {
			this.children.value.forEach((child) => {
				if (child.kind === 'directory') {
					openFolders.push(...child.getOpenFolders(currentPath ? [...currentPath, child.name] : [child.name]))
				}
			})
		}

		return openFolders
	}
	protected async openFolderPaths(paths: string[][], children: (DirectoryWrapper | FileWrapper)[]) {
		if (paths.length === 0) return

		for(const path of paths) {
			const folder = <DirectoryWrapper | undefined> children.find((child) => child.name === path[0] && child.kind === 'directory')

			if (folder) {
				await folder.open()
				if(folder.children.value) await folder.openFolderPaths([path.slice(1)], folder.children.value)
			}
		}
	}

	async refresh() {
		const openPaths = this.getOpenFolders([])

		const newChildren = await this.getChildren()

		await this.openFolderPaths(openPaths, newChildren)

		this.children.value = newChildren
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
		if(this.isOpen.value && !deep) return

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

	getChild(name: string) {
		if(!this.children.value) 
			throw new Error("Cannot use directoryWrapper.getChild(..) because children are not loaded yet")
		return this.children.value?.find((child) => child.name === name)
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
		showFolderContextMenu(event, this, {
			hideDelete: this.parent === null,
			hideRename: this.parent === null,
			hideDuplicate: this.parent === null,
		})
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
