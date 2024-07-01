<script lang="ts" setup>
import Icon from '@/components/Common/Icon.vue'
import TreeEditorValueElement from './TreeEditorValueElement.vue'
import TreeEditorObjectElement from './TreeEditorObjectElement.vue'

import { ref } from 'vue'

defineProps({
	name: {
		type: String,
		required: true,
	},
	value: {
		type: Object,
		required: true,
	},
})

const open = ref(false)
</script>

<template>
	<div
		class="hover:bg-background-secondary table px-1 rounded transition-colors ease-out duration-100 cursor-pointer"
		@click="open = !open"
	>
		<span class="flex gap-2">
			<Icon
				icon="chevron_right"
				class="text-base transition-rotate ease-out duration-100"
				:style="{
					rotate: open ? '90deg' : 'none',
				}"
			/>

			<span>"{{ name }}": </span>

			<TreeEditorValueElement v-if="!open" :value="value" />
			<span v-else>{</span>
		</span>
	</div>
	<div v-if="open">
		<div class="ml-4">
			<TreeEditorObjectElement :value="value" />
		</div>

		<span class="ml-2">}</span>
	</div>
</template>
