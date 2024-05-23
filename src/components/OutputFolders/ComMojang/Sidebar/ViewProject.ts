import { markRaw } from 'vue'
import { IComMojangProject } from '../ProjectLoader'
import { App } from '/@/App'
import { AnyDirectoryHandle } from '/@/components/FileSystem/Types'
import { InfoPanel } from '/@/components/InfoPanel/InfoPanel'
import { SelectableSidebarAction } from '/@/components/Sidebar/Content/SelectableSidebarAction'
import { SidebarAction } from '/@/components/Sidebar/Content/SidebarAction'
import { SidebarContent } from '/@/components/Sidebar/Content/SidebarContent'
import { SidebarElement } from '/@/components/Sidebar/SidebarElement'
import ViewProjectComponent from './ViewProject.vue'
import ProjectHeaderComponent from './ProjectHeader.vue'
import { showFolderContextMenu } from '/@/components/UIElements/DirectoryViewer/ContextMenu/Folder'
import { DirectoryWrapper } from '/@/components/UIElements/DirectoryViewer/DirectoryView/DirectoryWrapper'
import { IDisposable } from '/@/types/disposable'
import { addFilesToCommandBar } from '/@/components/CommandBar/AddFiles'

export class ViewComMojangProject extends SidebarContent {
	component = ViewProjectComponent
	actions: SidebarAction[] = []
	topPanel: InfoPanel | undefined = undefined
	headerHeight = '60px'

	hasComMojangProjectLoaded = false

	projectIcon?: string = undefined
	projectName?: string = undefined
	disposables: IDisposable[] = []

	protected sidebarElement: SidebarElement
	protected directoryEntries: Record<string, DirectoryWrapper> = {}
	protected closeAction = new SidebarAction({
		icon: 'mdi-close',
		name: 'general.close',
		color: 'error',
		onTrigger: () => {
			this.clearComMojangProject()
		},
	})

	constructor() {
		super()

		this.actions = [this.closeAction]

		this.sidebarElement = markRaw(
			new SidebarElement({
				id: 'viewComMojangProject',
				group: 'packExplorer',
				sidebarContent: this,
				displayName: 'packExplorer.name',
				icon: 'mdi-folder-outline',
				isVisible: () => this.hasComMojangProjectLoaded,
			})
		)
	}

	async loadComMojangProject(project: IComMojangProject) {
		const app = await App.getApp()
		this.hasComMojangProjectLoaded = true
		this.actions = [this.closeAction]

		for (const pack of project.packs.reverse()) {
			const packType = App.packType.getFromId(pack.type)
			if (!packType) continue

			const action = new SelectableSidebarAction(this, {
				icon: packType.icon,
				name: `packType.${pack.type}.name`,
				color: packType.color,
				id: pack.type,
			})
			this.actions.unshift(action)

			const wrapper = new DirectoryWrapper(null, pack.directoryHandle, {
				startPath: pack.packPath,
				defaultIconColor: packType.color,
			})
			await wrapper.open()

			addFilesToCommandBar(wrapper.handle, packType.color).then(
				(disposable) => {
					if (!this.hasComMojangProjectLoaded) disposable.dispose()
					else this.disposables.push(disposable)
				}
			)

			this.directoryEntries[pack.type] = markRaw(wrapper)
			if (pack.type === 'behaviorPack') action.select()
		}

		this.projectName = project.name
		this.projectIcon =
			project.packs.find((p) => p.type === 'behaviorPack')?.packIcon ??
			undefined

		app.projectManager.title.setProject(this.projectName)

		this.headerSlot = ProjectHeaderComponent
		this.sidebarElement.select()

		App.eventSystem.dispatch('comMojangProjectChanged', project)
	}
	async clearComMojangProject() {
		const app = await App.getApp()
		this.headerSlot = undefined
		this.hasComMojangProjectLoaded = false
		this.actions = [this.closeAction]
		this.directoryEntries = {}

		app.projectManager.title.setProject('')

		// Unselect ViewFolders tab by selecting packExplorer instead
		App.sidebar.elements.packExplorer.select()

		this.disposables.forEach((d) => d.dispose())
		this.disposables = []

		App.eventSystem.dispatch('comMojangProjectChanged')
	}

	onContentRightClick(event: MouseEvent): void {
		const selectedId = this.selectedAction?.getConfig().id
		if (!selectedId) return

		showFolderContextMenu(event, this.directoryEntries[selectedId], {
			hideDelete: true,
			hideRename: true,
			hideDuplicate: true,
		})
	}
}
