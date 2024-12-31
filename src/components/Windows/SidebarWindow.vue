<script setup lang="ts">
import IconButton from '@/components/Common/IconButton.vue'
import { useIsMobile } from '@/libs/Mobile'

import { onMounted, ref } from 'vue'

defineProps({
	name: {
		type: String,
		required: true,
	},
})

const emit = defineEmits(['open', 'close'])

function close() {
	emit('close')
}

onMounted(() => {
	emit('open')
})

const isMobile = useIsMobile()

const sidebarExpanded = ref(true)
</script>

<template>
	<div class="w-screen h-app flex justify-center items-center absolute top-toolbar left-0">
		<div class="bg-background-secondary w-screen h-app absolute top-0 left-0 opacity-30" @click="close" />

		<div v-if="isMobile" class="bg-background flex flex-col shadow-window rounded-md overflow-hidden window relative w-screen h-app">
			<div class="flex justify-between align-center p-2">
				<span class="flex align-center">
					<IconButton
						icon="chevron_left"
						class="text-base text-text-secondary transition-transform duration-200 ease-out"
						:class="{ 'rotate-180': sidebarExpanded }"
						@click="sidebarExpanded = !sidebarExpanded"
					/>

					<span class="select-none ml-1 text-text-secondary font-theme">
						{{ name }}
					</span>
				</span>

				<IconButton icon="close" class="text-sm" @click="close" />
			</div>

			<div class="relative w-full flex-1">
				<div class="bg-background-secondary w-full h-full absolute right-0 transition-[right] duration-200 ease-out" :class="{ 'right-full': !sidebarExpanded }">
					<slot name="sidebar" :hide="() => (sidebarExpanded = false)" />
				</div>

				<div class="w-full h-full absolute left-0 transition-[left] duration-200 ease-out" :class="{ 'left-full': sidebarExpanded }">
					<slot name="content" />
				</div>
			</div>
		</div>

		<div v-else class="bg-background shadow-window rounded-md overflow-hidden flex items-stretch window relative">
			<div class="bg-background-secondary w-96">
				<slot name="sidebar" :hide="() => (sidebarExpanded = false)" />
			</div>

			<div class="flex-1 w-min">
				<div class="flex justify-between align-center p-2">
					<span class="select-none ml-1 text-text-secondary font-theme">
						{{ name }}
					</span>
					<IconButton icon="close" class="text-sm" @click="close" />
				</div>

				<slot name="content" />
			</div>
		</div>
	</div>
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
