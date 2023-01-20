<template>
	<div style="overflow: hidden">
		<BridgeFolderBtn />
		<ImportOldProjects />
		<CreateProjectBtn color="success" />

		<BridgeSheet dark class="pa-2 mb-2 d-flex flex-column">
			<v-icon style="font-size: 3rem" color="error" class="mb-4">
				mdi-folder-open-outline
			</v-icon>
			{{ t('packExplorer.noProjectView.noProjectsFound') }}
		</BridgeSheet>

		<BridgeSheet
			v-if="showInstallAppButton"
			dark
			class="pa-2 mb-2 d-flex flex-column clickable"
			v-ripple
			@click.native="installApp"
		>
			<v-icon style="font-size: 3rem" color="primary" class="mb-4">
				mdi-download
			</v-icon>
			{{ t('initialSetup.step.installApp.description') }}
		</BridgeSheet>

		<BridgeSheet
			v-if="!isMobile && !isTauriBuild"
			dark
			class="pa-2 mb-2 d-flex flex-column"
			@click="openDownloadPage"
		>
			<v-icon style="font-size: 3rem" color="success" class="mb-4">
				mdi-minecraft
			</v-icon>
			{{ t('initialSetup.step.comMojang.description') }}

			<SetupHint />
		</BridgeSheet>

		<BridgeSheet
			v-if="!didChooseEditorType"
			dark
			class="pa-2 mb-2 d-flex flex-column"
			@click="chooseEditor"
		>
			<v-icon style="font-size: 3rem" color="success" class="mb-4">
				mdi-pencil-outline
			</v-icon>
			{{ t('initialSetup.step.editorType.description') }}

			<SetupHint />
		</BridgeSheet>
	</div>
</template>

<script>
import { App } from '/@/App'
import { TranslationMixin } from '/@/components/Mixins/TranslationMixin'
import BridgeSheet from '/@/components/UIElements/Sheet.vue'
import CreateProjectBtn from './CreateProjectBtn.vue'
import BridgeFolderBtn from './BridgeFolderBtn.vue'
import ImportOldProjects from './ImportOldProjects.vue'
import { SettingsWindow } from '/@/components/Windows/Settings/SettingsWindow'
import { settingsState } from '/@/components/Windows/Settings/SettingsState'
import { get, set } from 'idb-keyval'
import { isUsingFileSystemPolyfill } from '../../FileSystem/Polyfill'
import { InformedChoiceWindow } from '../../Windows/InformedChoice/InformedChoice'
import SetupHint from './SetupHint.vue'

export default {
	mixins: [TranslationMixin],
	components: {
		BridgeSheet,
		CreateProjectBtn,
		BridgeFolderBtn,
		ImportOldProjects,
		SetupHint,
	},
	setup() {
		return {
			downloadAppUrl: 'https://bridge-core.app/guide/download',
			isTauriBuild: import.meta.env.VITE_IS_TAURI_APP,
			isUsingFileSystemPolyfill,
		}
	},
	async mounted() {
		this.didChooseEditorType = (await get('didChooseEditorType')) ?? false

		const app = await App.getApp()
		this.disposables.push(
			App.installApp.isInstallable.once(
				() => (this.showInstallAppButton = true),
				true
			)
		)
		this.disposables.push(
			App.installApp.isInstalled.once(
				() => (this.showInstallAppButton = false),
				true
			)
		)
	},
	destroyed() {
		this.disposables.forEach((disposable) => disposable.dispose())
	},
	data() {
		return {
			didChooseEditorType: false,
			showInstallAppButton: false,
			disposables: [],
			actions: [],
		}
	},
	computed: {
		isMobile() {
			return this.$vuetify.breakpoint.mobile
		},
	},
	methods: {
		async chooseEditor() {
			const editors = [
				{
					icon: 'mdi-text',
					name: 'initialSetup.step.editorType.rawText.name',
					description:
						'initialSetup.step.editorType.rawText.description',
					onTrigger: () => {
						this.setJsonEditor('rawText')
					},
				},
				{
					icon: 'mdi-file-tree',
					name: 'initialSetup.step.editorType.treeEditor.name',
					description:
						'initialSetup.step.editorType.treeEditor.description',
					onTrigger: () => {
						this.setJsonEditor('treeEditor')
					},
				},
			]

			const choiceWindow = new InformedChoiceWindow(
				'initialSetup.step.editorType.name'
			)
			editors.forEach((editor) =>
				choiceWindow.actionManager.create(editor)
			)

			choiceWindow.open()
		},

		async setJsonEditor(val) {
			await SettingsWindow.loadSettings(App.instance)
			if (!settingsState.editor) settingsState.editor = {}
			settingsState.editor.jsonEditor = val
			await SettingsWindow.saveSettings(App.instance)

			this.didChooseEditorType = true
			await set('didChooseEditorType', true)
		},
		installApp() {
			App.installApp.prompt()
		},
		openDownloadPage() {
			App.openUrl(this.downloadAppUrl)
		},
	},
}
</script>
