<template>
	<BaseWindow
		v-if="shouldRender"
		windowTitle="windows.allWorlds.title"
		:isVisible="isVisible"
		:hasMaximizeButton="false"
		:isFullscreen="false"
		:percentageWidth="80"
		:percentageHeight="100"
		@closeWindow="close"
	>
		<template #default>
			<v-row>
				<v-col
					cols="12"
					:sm="6"
					:md="6"
					:lg="4"
					:xl="3"
					v-for="(world, i) in worlds"
					:key="i"
				>
					<v-card>
						<v-img height="225" :src="world.previewImage" />
						<v-card-title>{{ world.name }}</v-card-title>

						<v-card-actions>
							<v-spacer />
							<v-btn
								@click="viewWorld(world.directoryHandle)"
								color="primary"
								text
							>
								<v-icon class="mr-1" small>mdi-eye</v-icon>
								<span>{{ t('general.preview') }}</span>
							</v-btn>
						</v-card-actions>
					</v-card>
				</v-col>
			</v-row>
		</template>
	</BaseWindow>
</template>

<script>
import BaseWindow from '/@/components/Windows/Layout/BaseWindow.vue'
import { TranslationMixin } from '/@/components/Mixins/TranslationMixin.ts'
import { WorldTab } from '../Render/Tab'
import { App } from '/@/App'

export default {
	mixins: [TranslationMixin],
	components: {
		BaseWindow,
	},

	data() {
		return this.currentWindow
	},
	props: ['currentWindow'],
	methods: {
		close() {
			this.currentWindow.close()
		},
		async viewWorld(directoryHandle) {
			this.close()

			const app = await App.getApp()

			app.tabSystem.add(
				new WorldTab(directoryHandle, app.tabSystem),
				true,
				true
			)
		},
	},
}
</script>
