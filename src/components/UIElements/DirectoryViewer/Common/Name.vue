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
		baseWrapper: BaseWrapper,
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
			this.baseWrapper.unselectAll()
			this.baseWrapper.isSelected.value = true
		},
		onRightClick() {},
	},
	watch: {
		'baseWrapper.isEditingName.value'() {
			if (this.baseWrapper.isEditingName.value) {
				this.currentName = this.baseWrapper.name
			} else {
				if (this.$refs.name) this.$refs.name.focus()
			}
		},
	},
}
</script>

<style scoped>
.directory-viewer-name {
	cursor: pointer;
}
.directory-viewer-name.selected {
	background: var(--v-background-base);
	outline: none;
}
.directory-viewer-name:focus {
	outline: none;
}
</style>
