<template>
	<v-autocomplete
		prepend-inner-icon="mdi-magnify"
		solo
		rounded
		hide-details
		background-color="expandedSidebar"
		:append-icon="null"
		class="commandbar-input elevation-1"
		:menu-props="{
			rounded: 'lg',
			dense: true,
			'nudge-top': -12,
			'min-width': 'unset',
			'max-width': '500px',
			transition: 'slide-y-transition',
			contentClass: 'commandbar-menu elevation-4',
		}"
		:items="actions"
		:item-text="(item) => `${t(item.name)}\n${t(item.description)}`"
		:item-value="(item) => item"
		:placeholder="t('general.search')"
		auto-select-first
		:autofocus="autofocus"
		v-model="currentItem"
		@change="onSelectedAction"
		@focus="updateActions"
		@blur="$emit('blur')"
		spellcheck="false"
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
				:color="item.color || 'warning'"
				class="text-h5 font-weight-light white--text"
			>
				<v-icon color="white">{{ item.icon }}</v-icon>
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
import { useTranslations } from '/@/components/Composables/useTranslations.ts'
import { CommandBarExtensionItems } from '../Extensions/Scripts/Modules/CommandBar'
import { getDefaultFileIcon } from '/@/utils/file/getIcon'
import { devActions } from '../Developer/Actions'
import { getCommandBarActions } from './State'

export default {
	props: {
		autofocus: {
			type: Boolean,
			default: false,
		},
	},
	setup() {
		const { t } = useTranslations()

		return {
			t,
		}
	},
	async mounted() {
		this.updateActions()

		this.disposables.push(
			App.eventSystem.on('projectChanged', async () =>
				this.updateActions()
			)
		)
	},
	destroyed() {
		this.disposables.forEach((disposable) => disposable.dispose())
		this.disposables = []
	},
	data: () => ({
		currentItem: '',
		actions: [],
		disposables: [],
	}),
	methods: {
		async updateActions() {
			const app = await App.getApp()

			const baseActions = app.actionManager.getAllActions()
			if (import.meta.env.DEV) {
				baseActions.push(...devActions)
			}
			const extensionActions = [...CommandBarExtensionItems.values()]

			this.actions = [
				...baseActions,
				...(app.isNoProjectSelected || app.project.isVirtualProject
					? []
					: await this.loadFilesFromProject(app.project)),
				...extensionActions,
				...getCommandBarActions(),
			]
		},
		onSelectedAction(item) {
			this.$nextTick(() => (this.currentItem = ''))
			item.trigger()
			this.$emit('actionSelected')
		},
		async loadFilesFromProject(project) {
			if (!project || project.isVirtualProject) return

			await project.packIndexer.fired
			const files =
				(await project.packIndexer?.service.getAllFiles()) ?? []

			return files.map((filePath) => {
				const packType = App.packType.get(filePath)
				const fileType = App.fileType.get(filePath)

				return new SimpleAction({
					name: `[${project.relativePath(filePath)}]`,
					description: 'actions.openFile.name',
					icon: fileType?.icon ?? getDefaultFileIcon(filePath),
					color: packType?.color ?? 'primary',

					onTrigger: async () => {
						const fileHandle =
							await project.app.fileSystem.getFileHandle(filePath)

						project.openFile(fileHandle)
					},
				})
			})
		},
	},
}
</script>

<style>
.commandbar-input {
	width: 50vw !important;
	max-width: 500px !important;
}
.commandbar-menu {
	width: 50vw;
}
</style>
