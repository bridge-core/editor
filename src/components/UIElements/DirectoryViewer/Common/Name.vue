<template>
	<component
		:is="tagName"
		v-ripple
		tabindex="0"
		ref="name"
		class="directory-viewer-name d-flex justify-center align-center px-1 rounded-lg"
		:class="{ selected: baseWrapper.isSelected.value }"
		@click.prevent="onClick($event)"
		@keydown.space.exact.prevent="isFocused ? onClick($event) : null"
		@keydown.enter.prevent="onEnter"
		@keydown.stop="onKeyDown"
		@click.right.prevent="baseWrapper.onRightClick($event)"
		@focus.exact="onFocus"
		@blur="isFocused = false"
	>
		<v-icon class="pr-1" :color="baseWrapper.color" small>
			{{ baseWrapper.icon }}
		</v-icon>

		<span
			v-if="!baseWrapper.isEditingName.value"
			:style="{
				overflow: 'hidden',
				whiteSpace: 'nowrap',
				textOverflow: 'ellipsis',
			}"
		>
			{{ baseWrapper.name }}
		</span>
		<v-text-field
			v-else
			v-model="currentName"
			:style="{
				position: 'relative',
				top: '-3px',
			}"
			autofocus
			dense
			hide-details
			height="20px"
			@blur="baseWrapper.confirmRename()"
			@keydown.enter.stop.prevent="baseWrapper.confirmRename()"
			@keydown.space.prevent
		/>

		<v-spacer />

		<v-icon v-if="isFocused" :color="baseWrapper.color">
			mdi-circle-small
		</v-icon>
	</component>
</template>

<script>
import { CopyAction } from '../ContextMenu/Actions/Copy'
import { DeleteAction } from '../ContextMenu/Actions/Delete'
import { PasteAction } from '../ContextMenu/Actions/Paste'
import { BaseWrapper } from './BaseWrapper'
import { useDoubleClick } from '/@/components/Composables/DoubleClick'
import { platform } from '/@/utils/os'

export default {
	props: {
		type: {
			type: String,
			default: 'file',
		},
		tagName: { type: String, default: 'div' },
		baseWrapper: { type: BaseWrapper, required: true },
	},
	setup(props) {
		const onClick = useDoubleClick((isDoubleClick, event) => {
			props.baseWrapper.onClick(event, isDoubleClick)
		}, true)

		return {
			onClick,
		}
	},

	data: () => ({
		isFocused: false,

		currentName: '',
	}),
	methods: {
		onEnter(event) {
			if (platform() === 'darwin') this.baseWrapper.startRename()
			else this.onClick(event)
		},
		onFocus() {
			this.isFocused = true

			if (this.baseWrapper.isSelected.value) return
			this.select()
		},
		onKeyDown(event) {
			if (platform() === 'darwin' && !event.metaKey) return
			if (platform() !== 'darwin' && !event.ctrlKey) return

			console.log(event.code)
			if (event.code === 'KeyC') {
				// Copy the file/folder
				CopyAction(this.baseWrapper).onTrigger()
			} else if (event.code === 'KeyV') {
				// Paste the curent clipboard file/folder
				PasteAction(
					this.baseWrapper.kind === 'directory'
						? this.baseWrapper
						: this.baseWrapper.getParent()
				).onTrigger()
			} else if (event.code === 'Backspace') {
				DeleteAction(this.baseWrapper).onTrigger()
			}
		},

		focus() {
			if (this.$refs.name) this.$refs.name.focus()
		},
		select() {
			this.baseWrapper.unselectAll()
			this.baseWrapper.isSelected.value = true
		},
	},
	watch: {
		'baseWrapper.isEditingName.value'() {
			if (this.baseWrapper.isEditingName.value) {
				this.currentName = this.baseWrapper.name
			} else {
				this.focus()
			}
		},
	},
}
</script>

<style scoped>
.directory-viewer-name {
	cursor: pointer;
	transition: background-color 0.2s ease-in-out;
}
.directory-viewer-name.selected {
	background: var(--v-background-base);
	outline: none;
}
.directory-viewer-name:focus {
	outline: none;
}
</style>
