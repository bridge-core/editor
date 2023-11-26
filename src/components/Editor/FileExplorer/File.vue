<template>
	<div class="flex items-center gap-1" @click="click">
		<Icon icon="draft" :color="color" class="text-sm" />

		<span class="select-none"> {{ basename(path) }} </span>
	</div>
</template>

<script setup lang="ts">
import { App } from '/@/App'
import Icon from '/@/components/Common/Icon.vue'

import { basename } from '/@/libs/path'

function click() {
	App.instance.projectManager.currentProject?.openFile(path)
}

const { path } = defineProps({
	path: {
		type: String,
		required: true,
	},
	color: {
		type: String,
		default: 'text',
	},
})
</script>
