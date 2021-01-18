<template>
	<BaseWindow
		v-if="shouldRender"
		windowTitle="windows.createProject.title"
		:isVisible="isVisible"
		:isFullscreen="false"
		:isPersistent="false"
		:percentageWidth="80"
		:percentageHeight="80"
		@closeWindow="close"
	>
		<template #default>
			<v-file-input accept="image/png" v-model="projectIcon" />
			<v-text-field
				v-model="projectName"
				:label="t('windows.createProject.projectName')"
			/>
		</template>

		<template #actions>
			<v-spacer />
			<v-btn
				color="primary"
				:disabled="!hasRequiredData"
				@click="createProject"
			>
				<v-icon class="pr-2">mdi-plus</v-icon>
				<span>{{ t('windows.createProject.create') }}</span>
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
		return this.currentWindow
	},
	methods: {
		close() {
			this.currentWindow.close()
		},
		createProject() {
			console.log(this.projectIcon)
		},
	},
}
</script>

<style></style>
