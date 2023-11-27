<template>
	<div
		class="w-screen h-app flex justify-center items-center absolute top-toolbar left-0"
		v-if="App.instance.windows.opened(id).value"
	>
		<div
			class="bg-menu w-screen h-app absolute top-0 left-0 z-0 opacity-30"
		></div>

		<div
			class="bg-background shadow-window rounded-md overflow-hidden z-10"
		>
			<div class="w-full flex justify-between align-center p-2">
				<span class="select-none ml-1 text-textAlternate font-inter">
					{{ name }}
				</span>
				<IconButton icon="close" class="text-sm" @click="close" />
			</div>
			<slot />
		</div>
	</div>
</template>

<script setup lang="ts">
import IconButton from '/@/components/Common/IconButton.vue'

import { App } from '/@/App'

const props = defineProps({
	name: {
		type: String,
		required: true,
	},
	id: {
		type: String,
		required: true,
	},
})

function close() {
	App.instance.windows.close(props.id)
}

defineExpose({
	close,
})
</script>
