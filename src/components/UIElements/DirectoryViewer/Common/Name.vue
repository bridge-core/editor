<template>
	<component
		:is="tagName"
		v-ripple="!baseWrapper.isEditingName.value"
		tabindex="0"
		ref="name"
		class="directory-viewer-name d-flex justify-center align-center px-1 rounded-lg"
		:class="{
			selected: baseWrapper.isSelected.value,
			'drag-handle': !baseWrapper.isEditingName.value,
		}"
		@click.prevent="onClick($event)"
		@keydown.space.prevent="isFocused ? onClick($event) : null"
		@keydown.stop="onKeyDown"
		@click.right.prevent.stop="baseWrapper.onRightClick($event)"
		@focus.exact="onFocus"
		@blur="isFocused = false"
	>
		<v-tooltip
			v-if="hasDiagnostic && !baseWrapper.isEditingName.value"
			:color="diagnosticIconColor"
			right
		>
			<template #activator="{ on }">
				<BasicIconName
					v-on="on"
					:name="baseWrapper.name"
					:icon="diagnosticIcon"
					:color="diagnosticIconColor"
					:opacity="diagnosticOpacity"
					:showName="!baseWrapper.isEditingName.value"
				/>
			</template>

			<span>{{ diagnostic ? t(diagnostic.text) : '' }}</span>
		</v-tooltip>
		<template v-else>
			<BasicIconName
				:name="baseWrapper.name"
				:icon="baseWrapper.icon"
				:color="baseWrapper.color"
				:showName="!baseWrapper.isEditingName.value"
			/>
		</template>

		<v-text-field
			v-if="baseWrapper.isEditingName.value"
			v-model="currentName"
			:style="{
				position: 'relative',
				top: '-3px',
			}"
			autofocus
			dense
			hide-details
			height="20px"
			ref="renameInput"
			@blur="cancelRename"
			@keydown.enter.stop.prevent="confirmRename"
			@keydown.esc.stop.prevent="cancelRename"
			@keydown.space.prevent.stop.native
			@click.stop
			:rules="[rules.validName, rules.required]"
		/>

		<v-spacer />

		<v-icon v-if="isFocused" :color="baseWrapper.color">
			mdi-circle-small
		</v-icon>

		<!-- Context menu button for touch -->
		<v-btn
			v-if="pointerDevice === 'touch'"
			v-ripple="false"
			text
			icon
			small
			@click.stop="baseWrapper.onRightClick($event)"
		>
			<v-icon> mdi-dots-vertical-circle-outline </v-icon>
		</v-btn>
	</component>
</template>

<script>
import { CopyAction } from '../ContextMenu/Actions/Edit/Copy'
import { DeleteAction } from '../ContextMenu/Actions/Edit/Delete'
import { PasteAction } from '../ContextMenu/Actions/Edit/Paste'
import { BaseWrapper } from './BaseWrapper'
import BasicIconName from './BasicIconName.vue'
import { useDoubleClick } from '/@/components/Composables/DoubleClick'
import { TranslationMixin } from '/@/components/Mixins/TranslationMixin'
import { platform } from '/@/utils/os'
import { pointerDevice } from '/@/utils/pointerDevice'
import { extname } from '/@/utils/path'

export default {
	components: { BasicIconName },
	mixins: [TranslationMixin],
	props: {
		type: {
			type: String,
			default: 'file',
		},
		tagName: { type: String, default: 'div' },
		baseWrapper: { type: BaseWrapper, required: true },
		diagnostic: Object,
	},
	setup(props) {
		const onClick = useDoubleClick((isDoubleClick, event) => {
			props.baseWrapper.onClick(event, isDoubleClick)
		}, true)

		return {
			onClick,
			pointerDevice,
		}
	},

	data() {
		return {
			isFocused: false,

			currentName: '',
			rules: {
				required: (name) => !!name,
				validName: (name) => /^[^\\/:*?"<>|]*$/.test(name),
				notSameName: (name) =>
					platform() === 'win32'
						? name.toUpperCase() !==
						  this.baseWrapper.name.toUpperCase()
						: name !== this.baseWrapper.name,
			},
		}
	},
	computed: {
		diagnosticIcon() {
			return this.diagnostic.icon || 'mdi-alert-circle'
		},
		diagnosticIconColor() {
			switch (this.diagnostic.type) {
				case 'info':
					return 'info'
				case 'warning':
					return 'warning'
				default:
				case 'error':
					return 'error'
			}
		},
		diagnosticOpacity() {
			if (!this.diagnostic) return 1
			return this.diagnostic.opacity || 1
		},
		hasDiagnostic() {
			return this.diagnostic !== undefined && this.diagnostic !== null
		},
	},
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
			if (event.target.tagName === 'INPUT') return

			if (event.code === 'Enter') {
				// Enter to rename on darwin platforms or open on other platforms
				this.onEnter(event)
			} else if (platform() !== 'darwin' && event.code === 'F2') {
				// F2 to start rename on non-darwin platforms
				this.baseWrapper.startRename()
			}

			if (platform() === 'darwin' && !event.metaKey) return
			if (platform() !== 'darwin' && !event.ctrlKey) return

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

		cancelRename() {
			this.baseWrapper.isEditingName.value = false
		},
		confirmRename() {
			if (!this.rules.notSameName(this.currentName)) {
				this.cancelRename()
				return
			}

			if (
				!this.rules.validName(this.currentName) ||
				this.currentName.length === 0
			)
				return

			this.baseWrapper.confirmRename(this.currentName)
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

				// Set cursor position, in next tick so that input has been rendered
				this.$nextTick(() => {
					const input =
						this.$refs.renameInput.$el.getElementsByTagName(
							'input'
						)[0]
					if (input) {
						const extension = extname(this.currentName)
						const end = extension
							? this.currentName.indexOf(
									extname(this.currentName)
							  )
							: input.value.length
						input.setSelectionRange(0, end)
					}
				})
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

	/** New web thingy: https://web.dev/content-visibility/ */
	content-visibility: auto;
	contain-intrinsic-size: 24px;
}
.directory-viewer-name.selected {
	background: var(--v-background-base);
	outline: none;
}
.directory-viewer-name:focus {
	outline: none;
}
</style>
