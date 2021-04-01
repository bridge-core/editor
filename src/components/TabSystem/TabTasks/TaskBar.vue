<template>
	<div class="d-flex">
		<Task v-for="task in tasks" :key="task.id" :task="task" />
	</div>
</template>

<script>
import Task from './Task.vue'

export default {
	components: { Task },
	props: {
		tasks: Array,
	},
}
</script>

<style></style>
