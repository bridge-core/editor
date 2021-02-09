import { v4 as uuid } from 'uuid'
import { TabSystem } from './Main'
import { IFileSystem } from '@/components/FileSystem/Common'
import { App } from '@/App'
import { FileType } from '../Data/FileType'
import { selectedProject } from '../Project/Loader'

export abstract class Tab {
	protected fileSystem: IFileSystem | Promise<IFileSystem>
	abstract component: Vue.Component
	uuid = uuid()
	hasRemoteChange = false
	isUnsaved = false

	setIsUnsaved(val: boolean) {
		this.isUnsaved = val
	}

	constructor(protected parent: TabSystem, protected path: string) {
		this.fileSystem = new Promise(resolve => {
			App.ready.once(app => {
				resolve(app.fileSystem)
			})
		})
		this.fileSystem.then(fileSystem => (this.fileSystem = fileSystem))
	}

	get name() {
		const pathArr = this.path.split(/\\|\//g)
		return pathArr.pop()
	}
	getPath() {
		return this.path
	}
	getPackPath() {
		return this.path.replace(`projects/${selectedProject}/`, '')
	}
	get icon() {
		const fileType = FileType.get(this.getPackPath())
		console.log(fileType, this.getPackPath())
		if (fileType?.icon) return fileType.icon

		if (
			this.path.endsWith('.png') ||
			this.path.endsWith('.tga') ||
			this.path.endsWith('.jpg') ||
			this.path.endsWith('.jpeg')
		)
			return 'mdi-file-image-outline'

		return 'mdi-file-outline'
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
