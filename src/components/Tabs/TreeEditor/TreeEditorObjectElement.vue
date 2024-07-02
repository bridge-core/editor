<script lang="ts" setup>
import Icon from '@/components/Common/Icon.vue'
import TreeEditorPropertyElement from './TreeEditorPropertyElement.vue'

defineProps({
	editor: {
		required: true,
	},
	value: {
		type: Object,
		required: true,
	},
})
</script>

<template>
	<div v-if="typeof value === 'object'">
		<TreeEditorPropertyElement :editor="editor" v-for="key in Object.keys(value)" :name="key" :value="value[key]" />
	</div>
</template>
