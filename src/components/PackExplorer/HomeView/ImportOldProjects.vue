<template>
	<v-tooltip
		v-if="isTauriBuild"
		:disabled="availableWidth > 220"
		:color="color ? color : 'tooltip'"
		right
	>
		<template v-slot:activator="{ on }">
			<v-btn
				v-on="on"
				@click="onImportOldProjects"
				:color="color"
				class="mb-2"
				block
				max-width="100%"
				ref="button"
				:style="{
					overflow: 'hidden',
				}"
			>
				<v-icon class="mr-1">mdi-import</v-icon>
				<span v-if="availableWidth > 220">
					{{ t(`packExplorer.noProjectView.importOldProject.name`) }}
				</span>
			</v-btn>
		</template>
		<span>
			{{ t(`packExplorer.noProjectView.importOldProject.name`) }}
		</span>
	</v-tooltip>
</template>

<script>
import { get } from 'idb-keyval'
import { App } from '/@/App'
import { TranslationMixin } from '/@/components/Mixins/TranslationMixin'
import { ConfirmationWindow } from '../../Windows/Common/Confirm/ConfirmWindow'
import { virtualProjectName } from '../../Projects/Project/Project'
import { showFolderPicker } from '../../FileSystem/Pickers/showFolderPicker'
import { FileSystem } from '../../FileSystem/FileSystem'
import { InformationWindow } from '../../Windows/Common/Information/InformationWindow'

export default {
	mixins: [TranslationMixin],
	props: {
		color: {
			default: 'primary',
			type: String,
		},
	},
	setup() {
		return {
			isTauriBuild: import.meta.env.VITE_IS_TAURI_APP,
		}
	},
	async mounted() {
		const app = await App.getApp()

		// Logic for updating the current available width
		this.disposables.push(
			app.windowResize.on(() => this.calculateAvailableWidth())
		)
		this.calculateAvailableWidth()
	},
	destroyed() {
		this.disposables.forEach((disposable) => disposable.dispose())
		this.disposable = []
	},
	data() {
		return {
			disposables: [],
			availableWidth: 0,
		}
	},
	methods: {
		async onImportOldProjects() {
			const app = await App.getApp()

			// Show warning if the user has projects already
			const projects = (await app.fileSystem.readdir('projects')).filter(
				(projectName) => projectName !== virtualProjectName
			)

			if (projects.length > 0) {
				const confirmWindow = new ConfirmationWindow({
					description:
						'packExplorer.noProjectView.importOldProject.confirmOverwrite',
				})
				const choice = await confirmWindow.fired

				if (!choice) return
			}

			app.windows.loadingWindow.open()

			const bridgeProject = await showFolderPicker()

			if (!bridgeProject) {
				app.windows.loadingWindow.close()
				return
			}

			const bridgeProjectFs = new FileSystem(bridgeProject)
			// Ensure that the folder is a bridge project by checking for the config.json fike
			if (!(await bridgeProjectFs.fileExists('config.json'))) {
				app.windows.loadingWindow.close()

				new InformationWindow({
					description:
						'packExplorer.noProjectView.importOldProject.notABridgeProject',
				})
				return
			}

			const newProjectDir = await app.fileSystem.getDirectoryHandle(
				`projects/${bridgeProject.name}`,
				{ create: true }
			)
			await app.fileSystem.copyFolderByHandle(
				bridgeProject,
				newProjectDir,
				new Set(['builds', '.git'])
			)

			// Load projects
			app.projectManager.addProject(bridgeProject, true, true)

			app.windows.loadingWindow.close()
		},
		calculateAvailableWidth() {
			if (this.$refs.button)
				this.availableWidth =
					this.$refs.button.$el.getBoundingClientRect().width
		},
	},
}
</script>
