<script setup lang="ts">
import { Ref, onMounted, onUnmounted, ref } from 'vue'
import Icon from '@/components/Common/Icon.vue'

defineProps({
	name: {
		type: String,
		required: true,
	},
})

const expanded = ref(false)
const sizing: Ref<HTMLElement | null> = ref(null)

const size = ref('0px')

function updateSize() {
	if (!sizing.value) return

	size.value = `${sizing.value.getBoundingClientRect().height}px`
}

const observer = new ResizeObserver(() => {
	updateSize()
})

onMounted(() => {
	updateSize()

	if (!sizing.value) return

	observer.observe(sizing.value)
})

onUnmounted(() => {
	observer.disconnect()
})

function open() {
	expanded.value = true
}

defineExpose({
	open,
})
</script>

<template>
	<div
		class="bg-background-secondary overflow-hidden transition-[height] duration-100 ease-out"
		:style="`height: ${expanded ? size : '2.5rem'};`"
	>
		<div class="h-auto" ref="sizing">
			<div class="h-10 flex items-center p-3 justify-between cursor-pointer group" @click="() => (expanded = !expanded)">
				<span class="group-hover:text-primary transition-colors duration-100 ease-out select-none font-theme font-medium">{{
					name
				}}</span>
				<Icon
					icon="arrow_drop_down"
					class="transition-[transform, color] duration-100 ease-out group-hover:text-primary"
					:class="{ '-rotate-180': expanded }"
				/>
			</div>
			<div class="p-3 pt-1">
				<slot />
			</div>
		</div>
	</div>
</template>
