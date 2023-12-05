<template>
	<div
		class="w-screen h-app flex justify-center items-center absolute top-toolbar left-0"
		v-if="windows.opened(id).value"
	>
		<div
			class="bg-menu w-screen h-app absolute top-0 left-0 z-0 opacity-30"
		></div>

		<div
			class="bg-background shadow-window rounded-md overflow-hidden z-10 flex items-stretch"
		>
			<div class="bg-menuAlternate w-96">
				<slot name="sidebar" />
			</div>

			<div class="flex-1">
				<div class="flex justify-between align-center p-2">
					<span
						class="select-none ml-1 text-textAlternate font-inter"
					>
						{{ name }}
					</span>
					<IconButton icon="close" class="text-sm" @click="close" />
				</div>
				<slot name="content" />
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { windows } from '@/App'
import IconButton from '@/components/Common/IconButton.vue'

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
	windows.close(props.id)
}

defineExpose({
	close,
})
</script>
