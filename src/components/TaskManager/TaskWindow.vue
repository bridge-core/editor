<template>
	<BaseWindow
		v-if="shouldRender"
		windowTitle="windows.taskManager.title"
		:isVisible="isVisible"
		:hasMaximizeButton="false"
		:isFullscreen="false"
		:width="420"
		:height="500"
		@closeWindow="close"
	>
		<v-card
			v-for="(task, i) in tasks"
			:key="i"
			style="margin-bottom: 12px; padding-bottom: 12px;"
		>
			<v-card-title>
				<v-icon color="primary">{{ task.icon }}</v-icon>
				{{ t(task.name) }}
			</v-card-title>
			<v-card-text>
				{{ t(task.description) }}
			</v-card-text>
			<v-card-actions>
				<v-progress-linear
					:value="(task.currentStepCount / task.totalStepCount) * 100"
				/>
			</v-card-actions>
		</v-card>
	</BaseWindow>
</template>

<script>
import BaseWindow from '@/components/Windows/Layout/BaseWindow'
import { TranslationMixin } from '@/utils/locales'

export default {
	name: 'TaskWindow',
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
	},
	watch: {
		tasks(tasks) {
			if (tasks.length === 0) this.close()
		},
	},
}
</script>

<style></style>
