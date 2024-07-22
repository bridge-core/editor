<template>
	<div class="bg-background-secondary overflow-hidden transition-[height] duration-100 ease-out" ref="container">
		<div class="h-auto" ref="sizing">
			<div
				class="h-10 flex items-center p-3 justify-between cursor-pointer group"
				@click="() => (expanded = !expanded)"
			>
				<span
					class="group-hover:text-primary transition-colors duration-100 ease-out select-none font-inter font-medium"
					>{{ name }}</span
				>
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

<script setup lang="ts">
import { Ref, onMounted, onUnmounted, ref, watch } from 'vue'
import Icon from '@/components/Common/Icon.vue'

defineProps({
	name: {
		type: String,
		required: true,
	},
})

const expanded = ref(false)
const container: Ref<HTMLElement | null> = ref(null)
const sizing: Ref<HTMLElement | null> = ref(null)

function updateHeight(expanded: boolean) {
	if (!container.value) return
	if (!sizing.value) return

	if (expanded) {
		container.value.style.height = `${sizing.value.scrollHeight}px`
	} else {
		container.value.style.height = '2.5rem'
	}
}

watch(expanded, updateHeight)

const observer = new MutationObserver(
	function () {
		updateHeight(expanded.value)
	}.bind(this)
)

onMounted(() => {
	updateHeight(expanded.value)

	if (!sizing.value) return

	observer.observe(sizing.value, {
		childList: true,
		subtree: true,
		attributes: true,
		characterData: true,
	})
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
