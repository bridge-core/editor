import { App } from '@/App'
import { FileType } from '@/appCycle/FileType'
import { PackType } from '@/appCycle/PackType'
import { createWindow } from '@/components/Windows/create'
import { translate } from '@/utils/locales'
import ProjectExplorerComponent from './ProjectExplorer.vue'

const windowState: any = {
	sidebar: {
		selected: null,
		categories: [],
	},
}

App.eventSystem.on('projectChanged', () => {
	windowState.sidebar.selected = null
})

export function createProjectExplorer() {
	windowState.sidebar.categories = []
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

			windowState.sidebar.categories.push({
				packType: packType ? packType.id : 'unknown',
				icon: fileType && fileType.icon ? fileType.icon : 'mdi-folder',
				color: packType ? packType.color : undefined,
				text: translate(`fileType.${name}`),
				id: name,
			})
		})

		windowState.sidebar.categories = windowState.sidebar.categories.sort(
			(a: any, b: any) => {
				if (a.packType !== b.packType)
					return a.packType.localeCompare(b.packType)
				return a.text.localeCompare(b.text)
			}
		)
	})

	const projectExplorer = createWindow(ProjectExplorerComponent, windowState)
	projectExplorer.open()
	return projectExplorer
}
