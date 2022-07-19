<template>
	<div style="overflow: hidden">
		<BridgeFolderBtn />
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
			v-if="!hasComMojangSetup && !isUsingFileSystemPolyfill"
			dark
			class="pa-2 mb-2 d-flex flex-column"
		>
			<v-icon style="font-size: 3rem" color="success" class="mb-4">
				mdi-minecraft
			</v-icon>
			{{ t('initialSetup.step.comMojang.description') }}
		</BridgeSheet>

		<div v-else-if="!didChooseEditorType">
			<BridgeSheet dark class="pa-2 mb-2 d-flex flex-column">
				<v-icon style="font-size: 3rem" color="success" class="mb-4">
					mdi-pencil-outline
				</v-icon>
				{{ t('initialSetup.step.editorType.description') }}
			</BridgeSheet>

			<ActionViewer
				v-for="(action, i) in actions"
				:key="i"
				dark
				class="clickable"
				:action="action"
				hideTriggerButton
				v-ripple
				@click.native="action.trigger()"
			/>
		</div>
		<div
			v-if="
				!isUsingFileSystemPolyfill &&
				setupStepCount === 2 &&
				(!didChooseEditorType || !hasComMojangSetup)
			"
			class="d-flex justify-center"
		>
			<span>
				<v-icon color="primary" class="mr-1" small>mdi-cog</v-icon>
				<strong>Setup Step:</strong> {{ !hasComMojangSetup ? 1 : 2 }} /
				2
			</span>
			<v-spacer />
			<v-btn
				v-if="!hasComMojangSetup"
				icon
				@click="hasComMojangSetup = true"
				small
			>
				<v-icon>mdi-chevron-right</v-icon>
			</v-btn>
		</div>
	</div>
</template>

<script>
import { App } from '/@/App'
import { TranslationMixin } from '/@/components/Mixins/TranslationMixin'
import BridgeSheet from '/@/components/UIElements/Sheet.vue'
import CreateProjectBtn from './CreateProjectBtn.vue'
import BridgeFolderBtn from './BridgeFolderBtn.vue'
import { SimpleAction } from '/@/components/Actions/SimpleAction'
import ActionViewer from '/@/components/Actions/ActionViewer.vue'
import { SettingsWindow } from '/@/components/Windows/Settings/SettingsWindow'
import { settingsState } from '/@/components/Windows/Settings/SettingsState'
import { get, set } from 'idb-keyval'
import { comMojangKey } from '/@/components/OutputFolders/ComMojang/ComMojang'
import { isUsingFileSystemPolyfill } from '../../FileSystem/Polyfill'

export default {
	mixins: [TranslationMixin],
	components: {
		BridgeSheet,
		CreateProjectBtn,
		BridgeFolderBtn,
		ActionViewer,
	},
	setup() {
		return {
			isUsingFileSystemPolyfill,
		}
	},
	async mounted() {
		this.hasComMojangSetup = (await get(comMojangKey)) !== undefined
		this.didChooseEditorType = (await get('didChooseEditorType')) ?? false
		this.setupStepCount =
			Number(!this.hasComMojangSetup) + Number(!this.didChooseEditorType)

		const app = await App.getApp()
		this.disposables.push(
			app.comMojang.setup.once(() => {
				console.log(this.hasComMojangSetup)
				this.hasComMojangSetup = true
			}, true)
		)
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
			hasComMojangSetup: true,
			didChooseEditorType: false,
			showInstallAppButton: false,
			setupStepCount: 0,
			disposables: [],
			actions: [
				new SimpleAction({
					icon: 'mdi-text',
					name: 'initialSetup.step.editorType.rawText.name',
					description:
						'initialSetup.step.editorType.rawText.description',
					onTrigger: async () => {
						if (this.isLoading) return

						this.isLoading = true
						await this.setJsonEditor('rawText')
						this.$emit('next')
					},
				}),
				new SimpleAction({
					icon: 'mdi-file-tree',
					name: 'initialSetup.step.editorType.treeEditor.name',
					description:
						'initialSetup.step.editorType.treeEditor.description',
					onTrigger: async () => {
						if (this.isLoading) return

						this.isLoading = true
						await this.setJsonEditor('treeEditor')
						this.$emit('next')
					},
				}),
			],
		}
	},
	methods: {
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
	},
}
</script>
