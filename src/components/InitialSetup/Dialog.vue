<template>
	<v-dialog
		v-if="isVisible"
		:value="isVisible && stepId < steps.length + 1"
		fullscreen
		hide-overlay
		persistent
	>
		<v-card>
			<v-container :class="{ 'pt-12': windowControlsOverlay }">
				<div
					class="d-flex flex-column justify-center align-center text-center mb-6"
				>
					<Logo height="128" />
					<h1 class="text-h3">{{ t('initialSetup.welcome') }}</h1>
					<h2 class="text-h5">
						- {{ t('initialSetup.welcomeCaption') }} -
					</h2>
				</div>

				<v-stepper v-model="stepId" vertical>
					<template v-for="({ name, component }, i) in steps">
						<v-stepper-step
							:key="`${name}.header`"
							:complete="stepId > i + 1"
							:step="i + 1"
						>
							<span class="text-h5">{{ t(`${name}.name`) }}</span>
							<span class="text-body-2" v-if="stepId === i + 1">
								{{ t(`${name}.description`) }}
							</span>
						</v-stepper-step>

						<v-stepper-content
							:key="`${name}.content`"
							:step="i + 1"
						>
							<component
								:is="component"
								@next="onNext()"
								@done="onDone()"
							/>
						</v-stepper-content>
					</template>
				</v-stepper>
			</v-container>
		</v-card>
	</v-dialog>
</template>

<script>
import { App } from '/@/App.ts'
import { TranslationMixin } from '/@/components/Mixins/TranslationMixin.ts'
import InstallAppStep from './Steps/InstallApp.vue'
import BridgeProjectStep from './Steps/BridgeProject.vue'
import BridgeFolderStep from './Steps/BridgeFolder.vue'
import ComMojangStep from './Steps/ComMojang.vue'
import EditorTypeStep from './Steps/EditorType.vue'
import { FileSystemSetup } from '/@/components/FileSystem/Setup.ts'
import { WindowControlsOverlayMixin } from '/@/components/Mixins/WindowControlsOverlay.ts'
import { InitialSetup } from './InitialSetup.ts'
import { isUsingFileSystemPolyfill } from '/@/components/FileSystem/Polyfill'
import Logo from '../UIElements/Logo.vue'

export default {
	name: 'InitialSetupDialog',
	mixins: [TranslationMixin, WindowControlsOverlayMixin],
	components: { Logo },
	setup: () => {
		const isVisible = FileSystemSetup.state.showInitialSetupDialog

		return {
			isVisible,
		}
	},
	data: () => ({
		setupInProgress: true,
		stepId: 1,
		steps: [
			...(isUsingFileSystemPolyfill
				? [
						{
							name: 'initialSetup.step.bridgeProject',
							component: BridgeProjectStep,
						},
				  ]
				: [
						{
							name: 'initialSetup.step.bridge',
							component: BridgeFolderStep,
						},
						{
							name: 'initialSetup.step.comMojang',
							component: ComMojangStep,
						},
				  ]),
			{
				name: 'initialSetup.step.editorType',
				component: EditorTypeStep,
			},
		],
	}),
	mounted() {
		let addedInstallStep = false
		App.installApp.isInstallable.on(() => {
			if (addedInstallStep) return

			this.steps.unshift({
				name: 'initialSetup.step.installApp',
				component: InstallAppStep,
			})
			addedInstallStep = true
			this.stepId = 0
			this.$nextTick(() => (this.stepId = 1))
		})
		App.installApp.isInstalled.on(() => {
			this.onNext()
		})
	},
	methods: {
		onNext() {
			this.stepId++

			if (this.stepId > this.steps.length) {
				InitialSetup.ready.dispatch()
			}
		},
		onDone() {
			this.stepId = this.steps.length + 1
			InitialSetup.ready.dispatch()
		},
	},
}
</script>
