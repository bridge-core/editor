<template>
	<div class="ma-2">
		<v-text-field
			prepend-icon="mdi-chevron-right"
			v-model="input"
			@keydown.enter="onEnter"
			spellcheck="false"
			outlined
			dense
		/>

		<div
			v-for="({ time, command, output }, i) in props.sidebarContent.output
				.value"
			:key="i"
			class="mb-3"
		>
			<span class="font-weight-medium line-break">
				<span class="text--disabled">[{{ time }}]</span>
				{{ command }}
			</span>
			<div class="ml-3 line-break" v-for="(str, i) in output" :key="i">
				{{ str }}
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Terminal } from './Terminal'

const props = defineProps<{ sidebarContent: Terminal }>()

const input = ref('')

function onEnter() {
	props.sidebarContent.executeCommand(input.value)
	input.value = ''
}
</script>

<style scoped>
.line-break {
	line-break: normal;
}
</style>
