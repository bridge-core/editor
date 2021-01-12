<template>
	<BaseWindow
		v-if="shouldRender"
		:windowTitle="t('windows.selectFolder.title')"
		:isVisible="isVisible"
		:hasMaximizeButton="false"
		:hasCloseButton="false"
		:isFullscreen="false"
		:isPersistent="true"
		:width="420"
		:height="100"
		@closeWindow="close"
	>
		<template #default>
			<p>
				{{ t('windows.selectFolder.content') }}
			</p>
		</template>

		<template #actions>
			<v-spacer />
			<v-btn color="primary" @click="selectFolder">
				<v-icon class="pr-2">mdi-folder-outline</v-icon>
				<span>{{ t('windows.selectFolder.select') }}</span>
			</v-btn>
		</template>
	</BaseWindow>
</template>

<script>
import { TranslationMixin } from '@/utils/locales'
import BaseWindow from '../../Layout/BaseWindow'

export default {
	name: 'SelectProjectFolderWindow',
	mixins: [TranslationMixin],
	components: {
		BaseWindow,
	},
	props: ['currentWindow'],

	data() {
		return this.currentWindow.getState()
	},
	methods: {
		close() {
			this.currentWindow.close()
		},
		async selectFolder() {
			try {
				this.callback(
					await window.showDirectoryPicker({ mode: 'readwrite' })
				)
				this.close()
			} catch (e) {
				console.error(e)
			}
		},
	},
}
</script>

<style></style>
