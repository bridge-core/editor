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
	<span v-if="typeof value === 'object'" class="select-none" :style="{ fontFamily: 'Consolas' }">{{
		Object.keys(value as Object).length === 0 ? '{}' : '{...}'
	}}</span>

	<span v-else-if="typeof value === 'string'" class="select-none" :style="{ fontFamily: 'Consolas' }">
		"<HighlightedText :known-words="(editor as TreeEditorTab).knownWords" :value="value" type="string" />"
	</span>

	<span v-else-if="value === undefined" class="select-none" :style="{ fontFamily: 'Consolas' }">
		"<HighlightedText :known-words="(editor as TreeEditorTab).knownWords" value="undefined" type="atom" />"
	</span>

	<span v-else class="select-none" :style="{ fontFamily: 'Consolas' }"
		><HighlightedText
			:known-words="(editor as TreeEditorTab).knownWords"
			:value="value.toString()"
			:type="typeof value"
		/>
	</span>
</template>
