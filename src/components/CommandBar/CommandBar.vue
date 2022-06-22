<template>
	<v-autocomplete
		style="width: 100%"
		prepend-inner-icon="mdi-chevron-right"
		solo
		rounded
		hide-details
		:append-icon="null"
		:menu-props="{
			rounded: 'lg',
			dense: true,
			'nudge-top': -12,
			'min-width': 'unset',
			'max-width': '500px',
			transition: 'slide-y-transition',
			contentClass: 'commandbar-menu',
		}"
		:items="actions"
		:item-text="(item) => `${item.name}\n${item.description}`"
		:item-value="(item) => item"
		label="Search..."
		v-model="currentItem"
		@change="onSelectedAction"
	>
		<template v-slot:no-data>
			<v-list-item>
				<v-list-item-title>
					Search for files, actions or projects.
				</v-list-item-title>
			</v-list-item>
		</template>

		<template v-slot:item="{ item }">
			<v-list-item-avatar
				:color="item.color"
				class="text-h5 font-weight-light white--text"
			>
				<v-icon>{{ item.icon }}</v-icon>
			</v-list-item-avatar>
			<v-list-item-content>
				<v-list-item-title v-text="t(item.name)" />
				<v-list-item-subtitle v-text="t(item.description)" />
			</v-list-item-content>
		</template>
	</v-autocomplete>
</template>

<script>
import { SimpleAction } from '../Actions/SimpleAction'
import { App } from '/@/App'
import { TranslationMixin } from '/@/components/Mixins/TranslationMixin'

export default {
	mixins: [TranslationMixin],
	async mounted() {
		const app = await App.getApp()

		this.baseActions = app.actionManager.getAllActions()

		if (!app.isNoProjectSelected) this.loadFilesFromProject(app.project)

		this.disposables.push(
			App.eventSystem.on('projectChanged', async (project) =>
				this.loadFilesFromProject(project)
			)
		)
	},
	destroyed() {
		this.disposables.forEach((disposable) => disposable.dispose())
		this.disposables = []
	},
	data: () => ({
		currentItem: '',
		baseActions: [],
		fileActions: [],
		disposables: [],
	}),
	computed: {
		actions() {
			return [...this.baseActions, ...this.fileActions]
		},
	},
	methods: {
		onSelectedAction(item) {
			this.$nextTick(() => (this.currentItem = ''))
			item.trigger()
		},
		async loadFilesFromProject(project) {
			if (!project || project.isVirtualProject) return

			await project.packIndexer.fired
			const files =
				(await project.packIndexer?.service.getAllFiles()) ?? []

			this.fileActions = files.map((filePath) => {
				const packType = App.packType.get(filePath)
				const fileType = App.fileType.get(filePath)

				return new SimpleAction({
					name: `[${project.relativePath(filePath)}]`,
					description: 'actions.openFile.name',
					icon: fileType?.icon ?? 'mdi-file-outline',
					color: packType?.color ?? 'primary',

					onTrigger: async () => {
						const fileHandle = await project.app.fileSystem.getFileHandle(
							filePath
						)

						project.openFile(fileHandle)
					},
				})
			})
		},
	},
}
</script>

<style>
.commandbar-menu {
	width: 50vw;
}
</style>
