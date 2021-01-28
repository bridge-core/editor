<template>
	<BaseWindow
		v-if="shouldRender"
		windowTitle="windows.createProject.title"
		:isVisible="isVisible"
		:hasMaximizeButton="false"
		:isFullscreen="false"
		:isPersistent="isCreatingProject"
		:percentageWidth="80"
		:percentageHeight="80"
		@closeWindow="close"
	>
		<template #default>
			<v-file-input
				accept="image/png"
				outlined
				dense
				:prepend-icon="null"
				prepend-inner-icon="mdi-image-outline"
				v-model="projectIcon"
				:label="t('windows.createProject.packIcon')"
			/>
			<v-text-field
				v-model="projectName"
				:label="t('windows.createProject.projectName')"
				outlined
				dense
			/>
			<v-text-field
				v-model="projectPrefix"
				:label="t('windows.createProject.projectPrefix')"
				outlined
				dense
			/>
			<v-text-field
				v-model="projectAuthor"
				:label="t('windows.createProject.projectAuthor')"
				outlined
				dense
			/>
			<v-autocomplete
				v-model="projectTargetVersion"
				:label="t('windows.createProject.projectTargetVersion')"
				:items="availableTargetVersions"
				:loading="availableTargetVersionsLoading"
				outlined
				dense
			/>
		</template>

		<template #actions>
			<v-spacer />
			<v-btn
				color="primary"
				:disabled="!currentWindow.hasRequiredData"
				:loading="isCreatingProject"
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
		async createProject() {
			this.isCreatingProject = true
			await this.currentWindow.createProject()
			this.isCreatingProject = false
			this.currentWindow.close()
		},
	},
}
</script>
