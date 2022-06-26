<template>
	<div
		v-ripple
		tabindex="0"
		class="file d-flex px-1 rounded-lg"
		:class="{ selected: fileWrapper.isSelected.value }"
		@click="onClick"
		@click.right.prevent="directoryWrapper.onRightClick($event)"
		@focus="isFocused = true"
		@blur="isFocused = false"
		@keydown.space="onClick"
		@keydown.enter="onClick"
	>
		<v-icon class="pr-1" :color="fileWrapper.color" small>
			{{ fileWrapper.icon }}
		</v-icon>

		<span
			:style="{
				overflow: 'hidden',
				whiteSpace: 'nowrap',
				textOverflow: 'ellipsis',
			}"
		>
			{{ fileWrapper.name }}
		</span>

		<v-spacer />

		<v-icon v-if="isFocused" :color="fileWrapper.color">
			mdi-circle-small
		</v-icon>
	</div>
</template>

<script>
import { FileWrapper } from './FileWrapper'
import { platform } from '/@/utils/os'

export default {
	name: 'FileView',
	props: {
		fileWrapper: FileWrapper,
	},
	data: () => ({
		isFocused: false,
	}),
	methods: {
		onClick(event) {
			this.fileWrapper.openFile()

			// Unselect other wrappers if multiselect key is not pressed
			if (
				(platform() === 'darwin' && !event.metaKey) ||
				(platform() !== 'darwin' && !event.ctrlKey)
			)
				this.fileWrapper.parent.unselectAll()
			this.fileWrapper.isSelected.value = true

			// Find first div and focus it
			const firstDiv = event.path.find((el) => el.tagName === 'DIV')
			if (firstDiv) firstDiv.focus()
		},
	},
}
</script>

<style scoped>
.file {
	cursor: pointer;
}
.file.selected {
	background: var(--v-background-base);
	outline: none;
}
.file:focus {
	outline: none;
}
</style>
