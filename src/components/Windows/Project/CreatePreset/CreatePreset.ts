import {
	Sidebar,
	SidebarCategory,
	SidebarItem,
} from '@/components/Windows/Layout/Sidebar'
import CreatePresetComponent from './CreatePreset.vue'
import { BaseWindow } from '../../BaseWindow'
import { getFileSystem } from '@/utils/fs'
import { FileSystem } from '@/components/FileSystem/Main'
import { App } from '@/App'
import { v4 as uuid } from 'uuid'
export class CreatePresetWindow extends BaseWindow {
	protected sidebar = new Sidebar([])

	constructor() {
		super(CreatePresetComponent)
		this.defineWindow()
	}

	async addPreset(fs: FileSystem, manifestPath: string) {
		const manifest = await fs.readJSON(manifestPath)
		let category = <SidebarCategory | undefined>(
			this.sidebar.rawElements.find(
				element => element.getText() === manifest.category
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
			})
		)
		this.sidebar.setState(id, {
			...manifest,
			models: Object.fromEntries(
				manifest.fields.map(([_, id, opts = {}]: any) => [
					id,
					opts.default ?? '',
				])
			),
		})
	}

	async loadPresets(fs: FileSystem, dirPath = 'data/packages/preset') {
		const dirents = await fs.readdir(dirPath, { withFileTypes: true })

		for (const dirent of dirents) {
			if (dirent.kind === 'directory')
				this.loadPresets(fs, `${dirPath}/${dirent.name}`)
			else if (dirent.name === 'manifest.json')
				this.addPreset(fs, `${dirPath}/${dirent.name}`)
		}
	}

	async open() {
		const app = await App.getApp()
		app.windows.loadingWindow.open()
		this.sidebar.removeElements()

		const fs = await getFileSystem()
		await this.loadPresets(fs)

		app.windows.loadingWindow.close()
		super.open()
	}
}
