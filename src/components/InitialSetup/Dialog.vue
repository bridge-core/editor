<template>
	<v-dialog
		v-if="isVisible"
		:value="isVisible && stepId < steps.length + 1"
		fullscreen
		hide-overlay
	>
		<v-card>
			<v-container>
				<div
					class="d-flex flex-column justify-center align-center mb-3"
				>
					<img
						height="128"
						src="../../_assets/logo-simple.svg"
						alt=""
					/>
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
							<component :is="component" @next="onNext()" />
						</v-stepper-content>
					</template>
				</v-stepper>
			</v-container>
		</v-card>
	</v-dialog>
</template>

<script>
import { TranslationMixin } from '/@/components/Mixins/TranslationMixin'
import BridgeFolderStep from './Steps/BridgeFolder'
import ComMojangStep from './Steps/ComMojang'
import EditorTypeStep from './Steps/EditorType'
import { FileSystemSetup } from '/@/components/FileSystem/Setup'

export default {
	name: 'InitialSetupDialog',
	mixins: [TranslationMixin],
	setup() {
		return {
			isVisible: FileSystemSetup.state.showInitialSetupDialog,
		}
	},
	data: () => ({
		setupInProgress: true,
		stepId: 1,
		steps: [
			{
				name: 'initialSetup.step.bridge',
				component: BridgeFolderStep,
			},
			{
				name: 'initialSetup.step.comMojang',
				component: ComMojangStep,
			},
			{
				name: 'initialSetup.step.editorType',
				component: EditorTypeStep,
			},
		],
	}),
	methods: {
		async onNext() {
			this.stepId++
		},
	},
}
</script>
