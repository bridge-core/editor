<template>
	<div
		class="bg-menuAlternate overflow-hidden transition-[height] duration-100 ease-out"
		ref="container"
	>
		<div class="h-auto" ref="sizing">
			<div
				class="h-10 flex items-center p-3 justify-between cursor-pointer group"
				@click="() => (expanded = !expanded)"
			>
				<span class="group-hover:text-primary select-none">{{
					name
				}}</span>
				<Icon
					icon="arrow_drop_down"
					class="transition-transform duration-200 ease-out group-hover:text-primary"
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
import { Ref, onMounted, ref, watch } from 'vue'
import Icon from '/@/components/Common/Icon.vue'

defineProps({
	name: {
		type: String,
		required: true,
	},
})

const expanded = ref(false)
const container: Ref<HTMLElement | null> = ref(null)
const sizing: Ref<HTMLElement | null> = ref(null)

watch(expanded, (value) => {
	if (!container.value) return
	if (!sizing.value) return

	if (value) {
		container.value.style.height = `${sizing.value.scrollHeight}px`
	} else {
		container.value.style.height = '2.5rem'
	}
})

onMounted(() => {
	if (!container.value) return

	container.value.style.height = '2.5rem'
})
</script>
