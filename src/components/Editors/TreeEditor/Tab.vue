<template>
	<div class="editor-container" ref="editorContainer" tabindex="-1">
		<div
			class="pr-4 code-font"
			:style="`height: ${height - 196}px; overflow: auto;`"
			@blur="focusEditor"
			@scroll="onScroll"
		>
			<component
				:is="tab.treeEditor.tree.component"
				:tree="tab.treeEditor.tree"
				:treeEditor="tab.treeEditor"
			/>
		</div>

		<v-divider class="mb-4" />

		<div class="d-flex px-4" @blur="focusEditor">
			<v-combobox
				ref="addKeyInput"
				v-model="keyToAdd"
				@change="onAddKey"
				:items="propertySuggestions"
				:menu-props="{
					maxHeight: 124,
					top: false,
					contentClass: 'json-editor-suggestions-menu',
				}"
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
				:items="valueSuggestions"
				:menu-props="{
					maxHeight: 124,
					top: false,
					contentClass: 'json-editor-suggestions-menu',
				}"
				:label="t('editors.treeEditor.addValue')"
				class="mx-4"
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
	activated() {
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
		propertySuggestions() {
			return this.treeEditor.propertySuggestions.map((suggestion) => ({
				...suggestion,
				text: suggestion.value,
			}))
		},
		valueSuggestions() {
			return this.treeEditor.valueSuggestions.map((suggestion) => ({
				...suggestion,
				text: suggestion.value,
			}))
		},
	},
	methods: {
		focusEditor() {
			if (this.$refs.editorContainer) this.$refs.editorContainer.focus()
		},
		onEdit(value) {
			this.treeEditor.edit(value)
		},
		onAddKey(suggestion) {
			if (suggestion === null) return
			const { type = 'object', value = suggestion } = suggestion

			this.treeEditor.addKey(value, type)

			this.$nextTick(() => (this.keyToAdd = ''))
		},
		onAddValue(suggestion) {
			if (suggestion === null) return
			const { type = 'value', value = suggestion } = suggestion

			this.treeEditor.addValue(value, type)

			this.$nextTick(() => (this.valueToAdd = ''))
		},
		onScroll(event) {
			this.treeEditor.scrollTop = event.target.scrollTop
		},
	},
	watch: {
		treeEditor() {
			this.treeEditor.receiveContainer(this.$refs.editorContainer)
		},
		propertySuggestions() {
			if (this.propertySuggestions.length === 0) {
				this.$refs.addKeyInput.blur()
				this.$refs.addValueInput.focus()
			} else if (this.propertySuggestions.length > 0) {
				this.$refs.addValueInput.blur()
				this.$refs.addKeyInput.focus()
			}
		},
	},
}
</script>

<style>
.tree-editor-selection {
	border-radius: 2rem;
	background: rgba(170, 170, 170, 0.2);
}
.theme--dark .tree-editor-selection {
	background: rgba(100, 100, 100, 0.3);
}
.editor-container {
	outline: none;
}

/* Smaller suggestions menu */
.json-editor-suggestions-menu .v-list-item,
.small-list .v-list-item {
	min-height: 28px !important;
}
.json-editor-suggestions-menu .v-list-item__content,
.small-list .v-list-item__content {
	padding: 4px 0 !important;
}
</style>
