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

<template>
	<Transition>
		<div
			class="w-screen h-app flex justify-center items-center absolute top-toolbar left-0"
			v-if="windows.opened(id).value"
		>
			<div
				class="bg-menu w-screen h-app absolute top-0 left-0 z-0 opacity-30"
			></div>

			<div
				class="bg-background shadow-window rounded-md overflow-hidden z-10 window"
			>
				<div class="w-full flex justify-between align-center p-2">
					<span
						class="select-none ml-1 text-textAlternate font-inter"
					>
						{{ name }}
					</span>
					<IconButton icon="close" class="text-sm" @click="close" />
				</div>
				<slot />
			</div>
		</div>
	</Transition>
</template>

<style scoped>
.v-enter-active,
.v-leave-active {
	transition: opacity 0.15s ease, color 0.2s;
}

.v-enter-from,
.v-leave-to {
	opacity: 0;
}

.v-enter-active > .window {
	transition: scale 0.2s ease, translate 0.2s ease;
}

.v-leave-active > .window {
	transition: scale 0.2s ease, translate 0.2s ease;
}

.v-enter-to > .window,
.v-leave-from > .window {
	translate: 0px 0px;
	scale: 1;
}

.v-enter-from > .window,
.v-leave-to > .window {
	translate: 0px 1rem;
	scale: 0.95;
}
</style>
