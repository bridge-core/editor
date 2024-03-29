<template>
	<details v-if="$slots.default" :open="tree.isOpen" tabindex="-1">
		<summary
			:class="{
				'common-tree-key': true,
				open: tree.isOpen,
				'tree-editor-selection': tree.isSelected,
			}"
			:style="{ height: pointerDevice === 'touch' ? '26px' : null }"
			@click.stop.prevent="onClickKey"
			@contextmenu.prevent="treeEditor.onContextMenu($event, tree)"
			tabindex="-1"
			@pointerdown="onTouchStart($event)"
			@pointerup="onTouchEnd"
			@pointermove="onTouchEnd"
			@pointercancel="onTouchEnd"
		>
			<v-icon
				class="mr-1 open-state-icon"
				:style="{
					position: 'relative',
					opacity: tree.hasChildren ? null : '60%',
					top: tree.hasChildren ? '0px' : '-1.5px',
				}"
				@click.native.stop.prevent="tree.toggleOpen()"
				small
			>
				mdi-chevron-right
			</v-icon>

			<span v-if="showArrayIndices || tree.parent.type === 'object'">
				<!-- Debugging helper -->
				<span v-if="isDevMode">
					s: {{ tree.type }} p: {{ tree.parent.type }}
				</span>

				<span
					class="decoration-wavy"
					:class="{
						underline: diagnostic,
						'decoration-error':
							diagnostic && diagnostic.severity === 'error',
						'decoration-warning':
							diagnostic && diagnostic.severity === 'warning',
						'decoration-info':
							diagnostic && diagnostic.severity === 'info',
					}"
					:title="diagnostic?.message"
					@dblclick="tree.toggleOpen()"
				>
					<slot /> </span
				>{{ hideBracketsWithinTreeEditor ? undefined : ':' }}</span
			>
			<!-- Spacer to make array objects easier to select -->
			<span
				v-else-if="!showArrayIndices"
				:class="{
					'mx-1': pointerDevice !== 'touch',
					'mx-6': pointerDevice === 'touch',
				}"
			/>

			<span class="pl-1" @click.stop.prevent="tree.toggleOpen()">
				{{ openingBracket }}
			</span>

			<!-- Error icon + tooltip -->
			<v-tooltip
				v-if="!tree.isOpen && tree.childHasDiagnostics"
				color="warning"
				right
			>
				<template v-slot:activator="{ on }">
					<v-icon v-on="on" small color="warning" @click.stop>
						mdi-alert-circle-outline
					</v-icon>
				</template>
				<span>{{ t('editors.treeEditor.childHasError') }}</span>
			</v-tooltip>
		</summary>

		<TreeChildren
			v-if="tree.isOpen"
			:tree="tree"
			:treeEditor="treeEditor"
			@setActive="$emit('setActive')"
		/>
		{{ closingBracket }}
	</details>
	<TreeChildren
		v-else
		:tree="tree"
		:treeEditor="treeEditor"
		@setActive="$emit('setActive')"
	/>
</template>

<script>
import TreeChildren from './TreeChildren.vue'
import { useLongPress } from '/@/components/Composables/LongPress'
import { DevModeMixin } from '/@/components/Mixins/DevMode'
import { TranslationMixin } from '/@/components/Mixins/TranslationMixin'
import { settingsState } from '/@/components/Windows/Settings/SettingsState'
import { pointerDevice } from '/@/utils/pointerDevice'

const brackets = {
	array: '[]',
	object: '{}',
}

export default {
	name: 'ObjectTree',
	components: {
		TreeChildren,
	},
	mixins: [DevModeMixin, TranslationMixin],
	props: {
		tree: Object,
		treeKey: String,
		treeEditor: Object,
	},
	setup(props) {
		const { onTouchStart, onTouchEnd } = useLongPress(
			(event) => {
				// if (pointerDevice.value === 'touch')
				props.treeEditor.onContextMenu(event, props.tree)
			},
			null,
			() => {
				props.treeEditor.parent.app.contextMenu.setMayCloseOnClickOutside(
					true
				)
			},
			800
		)

		return {
			onTouchStart,
			onTouchEnd,
			pointerDevice,
		}
	},
	computed: {
		hideBracketsWithinTreeEditor() {
			if (!settingsState.editor) return false
			return settingsState.editor.hideBracketsWithinTreeEditor || false
		},
		showArrayIndices() {
			if (!settingsState.editor) return false
			return settingsState.editor.showArrayIndices || false
		},

		openingBracket() {
			if (this.hideBracketsWithinTreeEditor) return

			if (this.tree.isOpen) return brackets[this.tree.type][0]
			else if (Object.keys(this.tree.children).length > 0)
				return `${brackets[this.tree.type][0]}...${
					brackets[this.tree.type][1]
				}`
			return `${brackets[this.tree.type][0]}${
				brackets[this.tree.type][1]
			}`
		},
		closingBracket() {
			if (this.hideBracketsWithinTreeEditor) return

			return this.tree.isOpen ? brackets[this.tree.type][1] : undefined
		},
		diagnostic() {
			return this.tree.highestSeverityDiagnostic
		},
	},
	methods: {
		onClickKey(event) {
			this.$emit('setActive')

			if (settingsState.editor?.automaticallyOpenTreeNodes ?? true) {
				// Only close a tree if it's already selected
				if (!this.tree.isOpen || this.tree.isSelected)
					this.tree.toggleOpen()
			}

			if (event.altKey) this.treeEditor.toggleSelection(this.tree)
			else this.treeEditor.setSelection(this.tree)
		},
	},
}
</script>

<style scoped>
.common-tree-key {
	cursor: pointer;
	list-style-type: none;
	display: inline-block;
	outline: none;
}
.common-tree-key .open-state-icon {
	position: relative;
	top: -2px;
	transition: transform 0.1s ease-in-out;
	transform: rotate(0deg);
}
.common-tree-key.open .open-state-icon {
	transform: rotate(90deg);
}
</style>
