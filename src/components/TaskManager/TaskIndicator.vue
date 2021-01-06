<template>
	<v-btn @click="openTaskWindow" small icon>
		<v-icon :class="{ 'spin-icon': tasksRunning }" small>
			{{ tasksRunning ? 'mdi-loading' : 'mdi-check' }}
		</v-icon>
	</v-btn>
</template>

<script>
import { App } from '@/App.ts'
import { tasks } from '@/components/TaskManager/TaskManager.ts'

export default {
	data: () => ({
		tasks,
	}),
	computed: {
		tasksRunning() {
			return this.tasks.length > 0
		},
	},
	methods: {
		openTaskWindow() {
			if (this.tasksRunning) App.instance.taskManager.showWindow()
		},
	},
}
</script>

<style scoped>
.spin-icon {
	animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
	0% {
		transform: rotate(0deg);
	}
	100% {
		transform: rotate(360deg);
	}
}
</style>
