<template>
	<div>
		<div ref="sizing">
			<slot name="main" :expanded="expanded" :toggle="toggleExpanded" />
		</div>

		<div class="absolute" ref="container">
			<div v-if="expanded">
				<slot name="choices" :collapse="toggleExpanded" />
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
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
	if (!container.value) return
	if (!sizing.value) return

	container.value.style.width = `${sizing.value.clientWidth}px`
})
</script>
