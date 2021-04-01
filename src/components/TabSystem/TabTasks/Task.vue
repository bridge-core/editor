<template>
	<div class="d-flex px-1 align-center task" v-ripple @click="task.trigger()">
		<v-icon :color="task.color || 'primary'" class="mr-1" small>
			{{ task.icon }}
		</v-icon>
		<span class="task-name">{{ task.name }}</span>
	</div>
</template>

<script>
import { SimpleAction } from '/@/components/Actions/SimpleAction'

export default {
	props: {
		task: SimpleAction,
	},
}
</script>

<style scoped>
.task {
	cursor: pointer;
	border-radius: 8px;
}

.task .task-name {
	opacity: 0.7;
	font-size: 14px;
}
</style>
