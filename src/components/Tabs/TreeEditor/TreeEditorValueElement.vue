<script lang="ts" setup>
import HighlightedText from './HighlightedText.vue'
import { TreeEditorTab } from './TreeEditorTab'

defineProps({
	editor: {
		required: true,
	},
	value: {
		required: true,
	},
})
</script>

<template>
	<span v-if="typeof value === 'object'">{{ Object.keys(value as Object).length === 0 ? '{}' : '{...}' }}</span>
	<span v-else-if="typeof value === 'string'"
		>"<HighlightedText :known-words="(editor as TreeEditorTab).knownWords" :value="value" type="string" />"</span
	>
	<span v-else-if="value === undefined"
		>"<HighlightedText :known-words="(editor as TreeEditorTab).knownWords" value="undefined" type="atom" />"</span
	>
	<span v-else
		><HighlightedText
			:known-words="(editor as TreeEditorTab).knownWords"
			:value="value.toString()"
			:type="typeof value"
		/>
	</span>
</template>
