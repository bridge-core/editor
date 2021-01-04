import type Vue from 'vue'
import { DirectoryEntry } from '@/components/Sidebar/Content/Explorer/DirectoryEntry'
import { v4 as uuid } from 'uuid'
import type { TabSystem } from './Main'
import { FileSystem } from '@/fileSystem/Main'
import { IFileSystem } from '@/fileSystem/Common'


export abstract class Tab {
	protected fileSystem: IFileSystem | Promise<IFileSystem>
	abstract component: Vue.Component
	uuid = uuid()
	hasRemoteChange = false
	isUnsaved = false

	setIsUnsaved(val: boolean, changedData?: unknown) {
		this.isUnsaved = val
	}

	constructor(
		protected parent: TabSystem,
		protected path: string
	) {
		this.fileSystem = FileSystem.get()
		if(this.fileSystem instanceof Promise) this.fileSystem.then(fileSystem => this.fileSystem = fileSystem)
	}

	get name() {
		const pathArr = this.path.split(/\\|\//g)
		return pathArr.pop()
	}
	getPath() {
		return this.path
	}

	get isSelected() {
		return this.parent.selectedTab === this
	}
	select() {
		this.parent.select(this)
		return this
	}
	close() {
		this.parent.close(this)
	}
	isFor(path: string) {
		return path === this.path
	}

	onActivate() {}
	onDeactivate() {}
	onDestroy() {}

	abstract save(): void
}
