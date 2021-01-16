import { App } from '@/App'
import { FileType } from '@/appCycle/FileType'
import { PackType } from '@/appCycle/PackType'
import { createWindow } from '@/components/Windows/create'
import { translate } from '@/utils/locales'
import {
	ISidebarItemConfig,
	Sidebar,
	SidebarCategory,
	SidebarItem,
} from '../../Layout/Sidebar'
import PackExplorerComponent from './PackExplorer.vue'

class PackSidebarItem extends SidebarItem {
	protected packType: string
	protected kind: 'file' | 'directory'
	constructor(
		config: ISidebarItemConfig & {
			packType: string
			kind: 'file' | 'directory'
		}
	) {
		super(config)
		this.packType = config.packType
		this.kind = config.kind
	}
}

export class PackExplorerWindow {
	protected loadedPack = false
	protected sidebar = new Sidebar([])
	protected window?: any

	constructor() {
		App.eventSystem.on('projectChanged', () => {
			this.sidebar.resetSelected()
			this.loadedPack = false
		})
	}

	async loadPack() {
		this.sidebar.removeElements()
		let items: SidebarItem[] = []

		const dirents = await App.instance.packIndexer.readdir([])

		dirents.forEach(({ kind, displayName, name, path }: any) => {
			const fileType = FileType.get(undefined, name)
			const packType = fileType
				? PackType.get(
						`projects/test/${
							typeof fileType.matcher === 'string'
								? fileType.matcher
								: fileType.matcher[0]
						}`
				  )
				: undefined

			items.push(
				new PackSidebarItem({
					kind,
					packType: packType ? packType.id : 'unknown',
					id: path ?? name,
					text: displayName ?? translate(`fileType.${name}`),

					icon:
						fileType && fileType.icon
							? fileType.icon
							: `mdi-${
									kind === 'directory' ? 'folder' : 'file'
							  }-outline`,
					color: packType ? packType.color : undefined,
				})
			)
		})

		items = items.sort((a: any, b: any) => {
			if (a.packType !== b.packType)
				return a.packType.localeCompare(b.packType)
			return a.text.localeCompare(b.text)
		})

		this.sidebar.addElement(
			new SidebarCategory({
				text: 'windows.packExplorer.categories',
				items,
			})
		)

		this.window.open()
	}

	open() {
		this.window = createWindow(PackExplorerComponent, {
			sidebar: this.sidebar,
		})

		if (this.loadedPack) this.window.open()
		else
			new Promise<void>(resolve =>
				App.ready.once(app =>
					app.packIndexer.on(async () => {
						await this.loadPack()
						resolve()
					})
				)
			)
	}
	close() {
		this.window.close()
	}
}
