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
import ProjectExplorerComponent from './ProjectExplorer.vue'

const windowState = {
	sidebar: new Sidebar([]),
}

App.eventSystem.on('projectChanged', () => {
	windowState.sidebar.resetSelected()
})

class PackSidebarItem extends SidebarItem {
	protected packType: string
	constructor(config: ISidebarItemConfig & { packType: string }) {
		super(config)
		this.packType = config.packType
	}
}

export function createProjectExplorer() {
	windowState.sidebar.removeElements()
	let items: SidebarItem[] = []

	App.instance.packIndexer.readdir([]).then(dirents => {
		dirents.forEach(({ name }) => {
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
					packType: packType ? packType.id : 'unknown',
					id: name,
					text: translate(`fileType.${name}`),

					icon:
						fileType && fileType.icon
							? fileType.icon
							: 'mdi-folder',
					color: packType ? packType.color : undefined,
				})
			)
		})

		items = items.sort((a: any, b: any) => {
			if (a.packType !== b.packType)
				return a.packType.localeCompare(b.packType)
			return a.text.localeCompare(b.text)
		})

		windowState.sidebar.addElement(
			new SidebarCategory({
				text: 'windows.packExplorer.categories',
				items,
			})
		)

		const projectExplorer = createWindow(
			ProjectExplorerComponent,
			windowState
		)
		projectExplorer.open()
	})
}
