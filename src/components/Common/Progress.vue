<script setup lang="ts">
import { Ref, onMounted, ref, watch } from 'vue'

const props = defineProps({
	progress: {
		type: Number,
		required: true,
	},
	strokeWidth: {
		type: Number,
		default: 2,
	},
})

const radius: Ref<number> = ref(0)
const strokeDashArray: Ref<number> = ref(0)
const strokeDashOffset: Ref<number> = ref(0)

const svgElement: Ref<SVGAElement | null> = ref(null)

function updateSvg() {
	if (!svgElement.value) return

	radius.value =
		svgElement.value.getBoundingClientRect().width / 2 - props.strokeWidth

	const circumference = 2 * Math.PI * radius.value

	strokeDashArray.value = circumference

	strokeDashOffset.value = circumference * (1 - props.progress)
}

onMounted(() => {
	updateSvg()
})

watch(
	() => props.progress,
	() => {
		updateSvg()
	}
)
</script>

<template>
	<svg ref="svgElement" class="rotate-[270deg]">
		<circle
			:r="radius + 'px'"
			:cx="radius + strokeWidth + 'px'"
			:cy="radius + strokeWidth + 'px'"
			fill="transparent"
			:stroke-width="strokeWidth + 'px'"
			:stroke-dasharray="strokeDashArray + 'px'"
			:stroke-dashoffset="strokeDashOffset + 'px'"
		></circle>
	</svg>
</template>
