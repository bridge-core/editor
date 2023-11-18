<template>
	<div>
		<div
			class="flex items-center justify-between cursor-pointer"
			@click="toggleExpanded"
			ref="sizing"
		>
			<slot name="main" />

			<Icon
				icon="arrow_drop_down"
				class="transition-transform duration-200 ease-out"
				:class="{ '-rotate-180': expanded }"
			/>
		</div>

		<div class="absolute" ref="container">
			<div v-if="expanded" class="mt-4 bg-menu w-full p-2 rounded">
				<slot name="choices" />
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import Icon from './Icon.vue'

import { Ref, onMounted, ref } from 'vue'

const expanded = ref(false)
const container: Ref<HTMLElement | null> = ref(null)
const sizing: Ref<HTMLElement | null> = ref(null)

const emit = defineEmits(['expanded', 'collapsed'])

function toggleExpanded() {
	expanded.value = !expanded.value

	if (expanded.value) {
		emit('expanded')
	} else {
		emit('collapsed')
	}
}

onMounted(() => {
	console.log(container.value, sizing.value)

	if (!container.value) return
	if (!sizing.value) return

	container.value.style.width = `${sizing.value.clientWidth}px`
})
</script>
