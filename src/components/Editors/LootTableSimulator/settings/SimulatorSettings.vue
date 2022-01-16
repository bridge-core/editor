<template>
	<BaseWindow
		v-if="shouldRender"
		windowTitle="windows.lootSimulatorSettings.title"
		:isVisible="isVisible"
		:hasMaximizeButton="false"
		:isFullscreen="false"
		:percentageWidth="70"
		:percentageHeight="80"
		:hasCloseButton="false"
		:isPersistent="true"
	>
		<template #default>
			<h3>{{ t('windows.lootSimulatorSettings.repeat.name') }}</h3>
			<div class="d-flex">
				<v-select
					:items="repeatUntilOptions"
					dense
					mandatory
					inset
					outlined
					v-model="settings.currentRepeatUntilOption"
					class="mr-3"
				/>
				<v-text-field
					inset
					dense
					mandatory
					outlined
					:rules="repeatRules[settings.currentRepeatUntilOption]"
					v-model="settings.repeat[settings.currentRepeatUntilOption]"
					class="mr-3"
					:label="
						t(
							`windows.lootSimulatorSettings.repeat.${settings.currentRepeatUntilOption}.name`
						)
					"
				/>
				<!-- Also show quantity input if searching for item -->
				<v-text-field
					v-if="settings.currentRepeatUntilOption === 'itemFound'"
					inset
					dense
					mandatory
					outlined
					:rules="repeatRules.quantityFound"
					v-model="settings.repeat.quantityFound"
					:label="
						t(
							`windows.lootSimulatorSettings.repeat.quantityFound.name`
						)
					"
				/>

				<span class="ml-4 text-normal">{{
					t(
						`windows.lootSimulatorSettings.repeat.${settings.currentRepeatUntilOption}.description`
					)
				}}</span>
			</div>

			<!-- <h3>
				{{
					t(
						'windows.lootSimulatorSettings.killConditions.looting.name'
					)
				}}
			</h3>
			<div class="d-flex align-center">
				<div>
					<v-text-field
						inset
						dense
						mandatory
						outlined
						v-model="settings.killConditions.looting"
						hide-details
						:menu-props="{ maxHeight: 220 }"
					/>
				</div>
				<span class="ml-4 text-normal">{{
					t(
						'windows.lootSimulatorSettings.killConditions.looting.description'
					)
				}}</span>
			</div> -->
		</template>

		<template #actions>
			<v-spacer />
			<v-btn color="primary" @click="reset">
				<v-icon>mdi-close</v-icon>
				<span>{{ t('general.reset') }}</span>
			</v-btn>
			<v-btn
				color="primary"
				@click="close"
				:disabled="!currentWindow.hasRequiredData"
			>
				<v-icon>mdi-check</v-icon>
				<span>{{ t('general.confirm') }}</span>
			</v-btn>
		</template>
	</BaseWindow>
</template>

<script>
import { TranslationMixin } from '/@/components/Mixins/TranslationMixin.ts'
import BaseWindow from '/@/components/Windows/Layout/BaseWindow.vue'
export default {
	name: 'CreateProjectWindow',
	mixins: [TranslationMixin],
	components: {
		BaseWindow,
	},
	props: ['currentWindow'],
	data() {
		return this.currentWindow
	},
	methods: {
		close() {
			this.currentWindow.close()
		},
		reset() {
			this.currentWindow.settings = this.currentWindow.getDefaultSettings()
		},
	},
}
</script>
