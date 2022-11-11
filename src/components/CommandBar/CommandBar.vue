<template>
	<v-autocomplete
		prepend-inner-icon="mdi-magnify"
		rounded
		hide-details
		background-color="expandedSidebar"
		:append-icon="null"
		class="commandbar-input elevation-1"
		:menu-props="{
			rounded: 'lg',
			dense: true,
			offset: [12, 0],
			'min-width': 'unset',
			'max-width': '500px',
			transition: 'slide-y-transition',
			contentClass: 'commandbar-menu',
			'max-height': '300px',
		}"
		:items="actions"
		:item-text="(item) => `${t(item.name)}\n${t(item.description)}`"
		:item-value="(item) => item"
		:placeholder="t('general.search')"
		auto-select-first
		:autofocus="autofocus"
		:model-value="currentItem"
		@update:modelValue="onSelectedAction"
		@focus="updateActions"
		@blur="$emit('blur')"
	>
		<template v-slot:no-data>
			<v-list-item>
				<v-list-item-title>
					Search for files, actions or projects.
				</v-list-item-title>
			</v-list-item>
		</template>

		<template v-slot:item="{ props, item: { raw: action } }">
			<v-list-item
				v-bind="props"
				:title="t(action.name)"
				:subtitle="t(action.description)"
			>
				<template v-slot:prepend>
					<v-avatar
						:color="action.color || 'warning'"
						class="text-h5 font-weight-light white--text"
					>
						<v-icon size="x-small" color="white">
							{{ action.icon }}
						</v-icon>
					</v-avatar>
				</template>
			</v-list-item>
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
	emits: ['actionSelected', 'blur'],
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
				...(app.isNoProjectSelected
					? []
					: await this.loadFilesFromProject(app.project)),
				...extensionActions,
				...getCommandBarActions(),
			]
		},
		onSelectedAction(item) {
			item.trigger()
			this.$emit('actionSelected')
			this.currentItem = ''
			setTimeout(() => document.activeElement.blur(), 10)
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
