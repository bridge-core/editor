<template>
	<div class="flex items-center gap-1">
		<Icon icon="draft" :color="color" class="text-sm" />

		<span class="select-none"> {{ basename(path) }} </span>
	</div>
</template>

<script setup lang="ts">
import Icon from '/@/components/Common/Icon.vue'

import { basename } from '/@/libs/path'

defineProps({
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
