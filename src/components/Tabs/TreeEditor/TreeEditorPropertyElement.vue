<script lang="ts" setup>
import Icon from '@/components/Common/Icon.vue'
import TreeEditorValueElement from './TreeEditorValueElement.vue'
import TreeEditorObjectElement from './TreeEditorObjectElement.vue'
import HighlightedText from './HighlightedText.vue'

import { ref } from 'vue'
import { TreeEditorTab } from './TreeEditorTab'

const { value } = defineProps({
	editor: {
		required: true,
	},
	name: {
		type: String,
		required: true,
	},
	value: {
		required: true,
	},
})

const open = ref(false)

function click() {
	if (typeof value !== 'object') return

	open.value = !open.value
}
</script>

<template>
	<div
		class="hover:bg-background-secondary table px-1 rounded transition-colors ease-out duration-100 cursor-pointer"
		@click="click"
	>
		<span class="flex gap-2">
			<Icon
				icon="chevron_right"
				class="text-base transition-rotate ease-out duration-100"
				:style="{
					rotate: open ? '90deg' : 'none',
				}"
				:color="typeof value === 'object' ? 'text' : 'textSecondary'"
			/>

			<span class="select-none" :style="{ fontFamily: 'Consolas' }">
				"<HighlightedText :known-words="(editor as TreeEditorTab).knownWords" :value="name" type="string" />":
			</span>

			<TreeEditorValueElement v-if="!open" :editor="editor" :value="value" />
			<span v-else>{</span>
		</span>
	</div>
	<div v-if="open">
		<div class="ml-4">
			<TreeEditorObjectElement :editor="editor" :value="<Object>value" />
		</div>

		<span class="ml-2">}</span>
	</div>
</template>
