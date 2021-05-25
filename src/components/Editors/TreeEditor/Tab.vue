<template>
	<div class="editor-container" ref="editorContainer" tabindex="-1">
		<div
			class="pr-4 code-font"
			:style="`height: ${height - 56}px; overflow: auto;`"
			@blur="focusEditor"
		>
			<component
				:is="tab.treeEditor.tree.component"
				:tree="tab.treeEditor.tree"
				:treeEditor="tab.treeEditor"
			/>
		</div>

		<div class="d-flex px-4" @blur="focusEditor">
			<v-combobox
				ref="addKeyInput"
				v-model="keyToAdd"
				@change="onAddKey"
				:label="t('editors.treeEditor.addObject')"
				outlined
				dense
				hide-details
			/>
			<v-combobox
				ref="addValueInput"
				v-model="valueToAdd"
				@change="onAddValue"
				:disabled="isGlobal"
				class="mx-4"
				:label="t('editors.treeEditor.addValue')"
				outlined
				dense
				hide-details
			/>
			<v-text-field
				ref="editValueInput"
				:value="currentValue"
				@change="onEdit"
				:disabled="isGlobal"
				:label="t('editors.treeEditor.edit')"
				outlined
				dense
				hide-details
			/>
		</div>
	</div>
</template>

<script>
import { TranslationMixin } from '../../Mixins/TranslationMixin'
import { TreeValueSelection } from './TreeSelection'

export default {
	name: 'TreeTab',
	mixins: [TranslationMixin],
	props: {
		tab: Object,
		height: Number,
	},
	data: () => ({
		keyToAdd: '',
		valueToAdd: '',
	}),
	mounted() {
		this.treeEditor.receiveContainer(this.$refs.editorContainer)
		this.focusEditor()
	},
	computed: {
		treeEditor() {
			return this.tab.treeEditor
		},
		currentValue() {
			let first = undefined
			this.treeEditor.forEachSelection((selection) => {
				if (!selection.getTree().parent) return

				let current
				if (selection instanceof TreeValueSelection)
					current = selection.getTree().value
				else current = selection.getTree().key

				if (first === undefined) {
					first = current
				} else if (first !== current) {
					first = ''
				}
			})

			return first
		},
		isGlobal() {
			let isGlobal = false
			this.treeEditor.forEachSelection((selection) => {
				if (isGlobal) return
				if (!selection.getTree().parent) {
					isGlobal = true
				}
			})

			return isGlobal
		},
	},
	methods: {
		focusEditor() {
			if (this.$refs.editorContainer) this.$refs.editorContainer.focus()
		},
		onEdit(value) {
			console.log(value)
			this.treeEditor.forEachSelection((selection) => {
				console.log(selection)
				selection.edit(value)
			})
		},
		onAddKey(value) {
			if (value === null) return

			console.log(value)
			this.treeEditor.forEachSelection((selection) => {
				if (selection instanceof TreeValueSelection) return

				selection.addKey(value)
			})

			this.$nextTick(() => (this.keyToAdd = ''))
		},
		onAddValue(value) {
			if (value === null) return

			if (!Number.isNaN(Number(value))) value = Number(value)
			else if (value === 'null') value = null
			else if (value === 'true' || value === 'false')
				value = value === 'true'

			this.treeEditor.forEachSelection((selection) => {
				if (selection instanceof TreeValueSelection) return

				selection.addValue(value)
			})

			this.$nextTick(() => (this.valueToAdd = ''))
		},
	},
}
</script>

<style>
.tree-editor-selection {
	border-radius: 4px;
	font-weight: bold;
	font-style: italic;
	text-decoration: underline;
	background: rgba(170, 170, 170, 0.2);
}
.theme--dark .tree-editor-selection {
	background: rgba(100, 100, 100, 0.5);
}
.editor-container {
	outline: none;
}
</style>
