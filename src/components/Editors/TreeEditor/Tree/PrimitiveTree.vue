<template>
	<div
		tabindex="-1"
		:style="{
			display: 'block',
			whiteSpace: 'nowrap',
			height: pointerDevice === 'touch' ? '26px' : null,
		}"
	>
		<div
			style="display: inline-block"
			:class="{
				'tree-editor-selection':
					tree.type !== 'object' &&
					tree.type !== 'array' &&
					tree.isSelected,
			}"
			@contextmenu.prevent.stop="treeEditor.onContextMenu($event, tree)"
			@pointerdown="onKeyTouchStart($event)"
			@pointerup="onKeyTouchEnd"
		>
			<v-icon
				class="mr-1"
				:style="{ opacity: '60%', position: 'relative', top: '-1.5px' }"
				small
			>
				mdi-chevron-right
			</v-icon>
			<span v-if="tree.parent.type === 'object'">
				<span @click.stop.prevent="onClickKey"><slot /></span>:</span
			>
		</div>

		<!-- Debugging helper -->
		<span v-if="isDevMode">
			s: {{ tree.type }} p: {{ tree.parent.type }}</span
		>

		<Highlight
			:style="{
				height: '20.5px',
				display: 'inline-block',
			}"
			:def="highlighterInfo"
			:value="this.tree.type === 'string' ? treeValue : undefined"
			:class="{
				'tree-editor-selection': tree.isValueSelected,
				'px-1': true,
			}"
			@click.stop.prevent.native="onClickKey($event, true)"
			@contextmenu.prevent.native="
				treeEditor.onContextMenu($event, tree, false)
			"
			@pointerdown.native="onTouchStart($event)"
			@pointerup.native="onTouchEnd"
			@pointermove="onTouchEnd"
			@pointercancel="onTouchEnd"
		>
			{{ treeValue }}
		</Highlight>
	</div>
</template>

<script>
import Highlight from '../Highlight.vue'
import { DevModeMixin } from '/@/components/Mixins/DevMode'
import { HighlighterMixin } from '/@/components/Mixins/Highlighter'
import { useLongPress } from '/@/components/Composables/LongPress'
import { pointerDevice } from '/@/utils/pointerDevice'

export default {
	components: { Highlight },
	name: 'PrimitiveTree',
	mixins: [HighlighterMixin(['atom', 'string', 'number']), DevModeMixin],
	props: {
		tree: Object,
		treeEditor: Object,
	},
	setup(props) {
		const { onTouchStart, onTouchEnd } = useLongPress(
			(event) => {
				if (pointerDevice.value === 'touch')
					props.treeEditor.onContextMenu(event, props.tree, false)
			},
			null,
			() => {
				props.treeEditor.parent.app.contextMenu.setMayCloseOnClickOutside(
					true
				)
			}
		)

		const { onTouchStart: onKeyTouchStart, onTouchEnd: onKeyTouchEnd } =
			useLongPress(
				(event) => {
					if (pointerDevice.value === 'touch')
						props.treeEditor.onContextMenu(event, props.tree)
				},
				null,
				() => {
					props.treeEditor.parent.app.contextMenu.setMayCloseOnClickOutside(
						true
					)
				}
			)

		return {
			onTouchStart,
			onTouchEnd,
			onKeyTouchStart,
			onKeyTouchEnd,
			pointerDevice,
		}
	},
	computed: {
		treeValue() {
			if (this.tree.value === null) return 'null'
			else if (this.tree.type === 'string') return this.tree.value
			return this.tree.value
		},
		highlighterInfoDef() {
			switch (this.tree.type) {
				case 'number':
					return 'numberDef'
				case 'string':
					return undefined
				case 'boolean':
					return 'atomDef'
				case 'null':
					return 'atomDef'
				default:
					throw new Error(
						`Unknown primitive type: "${this.tree.type}"`
					)
			}
		},
		highlighterInfo() {
			return this[this.highlighterInfoDef]
		},
		textDecoration() {
			if (!this.highlighterInfo.textDecoration)
				this.highlighterInfo.textDecoration = ''

			if (this.highlighterInfo.isItalic)
				this.highlighterInfo.textDecoration += ' italic'
			return this.highlighterInfo.textDecoration
		},
	},
	methods: {
		onClickKey(event, selectValue) {
			this.$emit('setActive')
			if (event.altKey)
				this.treeEditor.toggleSelection(this.tree, selectValue)
			else this.treeEditor.setSelection(this.tree, selectValue)
		},
	},
}
</script>
