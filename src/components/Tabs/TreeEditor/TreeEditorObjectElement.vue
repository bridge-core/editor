<script lang="ts" setup>
import Icon from '@/components/Common/Icon.vue'
import TreeEditorPropertyElement from './TreeEditorPropertyElement.vue'

defineProps({
	value: {
		type: Object,
		required: true,
	},
})
</script>

<template>
	<div v-if="typeof value === 'object'">
		<TreeEditorPropertyElement v-for="key in Object.keys(value)" :name="key" :value="value[key]" />
	</div>
</template>
