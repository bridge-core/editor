<template>
	<div
		class="editor-container"
		:style="{ fontSize, fontFamily: codeFontFamily }"
		ref="editorContainer"
		@click="tab.parent.setActive(true)"
		tabindex="-1"
	>
		<div
			class="pr-4"
			:style="`height: ${
				height - !tab.isReadOnly * 194
			}px; overflow: auto;`"
			@blur="focusEditor"
			@scroll="onScroll"
			@contextmenu.prevent.stop="tab.treeEditor.onPasteMenu($event)"
		>
			<component
				:is="tab.treeEditor.tree.component"
				:tree="tab.treeEditor.tree"
				:treeEditor="tab.treeEditor"
				@setActive="tab.parent.setActive(true)"
			/>
		</div>

		<v-divider v-if="!tab.isReadOnly" class="mb-4" />

		<div
			v-if="!tab.isReadOnly"
			class="d-flex px-4"
			:style="{ fontFamily }"
			@blur="focusEditor"
		>
			<v-combobox
				ref="addKeyInput"
				v-model="keyToAdd"
				@change="onAddKey"
				@keydown.enter="mayTrigger"
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
			>
				<template v-slot:item="{ item }">
					<div style="width: 100%" @click="mayTrigger">
						<v-icon class="mr-1" color="primary" small>
							{{ getIcon(item) }}
						</v-icon>
						<span
							style="
								font-size: 0.8125rem;
								font-weight: 500;
								line-height: 1rem;
							"
						>
							{{ item.label }}
						</span>
					</div>
				</template>
			</v-combobox>
			<v-combobox
				ref="addValueInput"
				v-model="valueToAdd"
				@change="onAddValue"
				@keydown.enter="mayTrigger"
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
			>
				<template v-slot:item="{ item }">
					<div style="width: 100%" @click="mayTrigger">
						<v-icon class="mr-1" color="primary" small>
							{{ getIcon(item) }}
						</v-icon>
						<span
							style="
								font-size: 0.8125rem;
								font-weight: 500;
								line-height: 1rem;
							"
						>
							{{ item.label }}
						</span>
					</div>
				</template>
			</v-combobox>
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
import { TranslationMixin } from '/@/components/Mixins/TranslationMixin'
import { settingsState } from '/@/components/Windows/Settings/SettingsState'
import { TreeValueSelection } from './TreeSelection'
import { PrimitiveTree } from './Tree/PrimitiveTree'

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
		triggerCooldown: false,
		isUserControlledTrigger: false,
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
		fontSize() {
			return settingsState &&
				settingsState.appearance &&
				settingsState.appearance.editorFontSize
				? `${settingsState.appearance.editorFontSize}`
				: '14px'
		},
		codeFontFamily() {
			return settingsState &&
				settingsState.appearance &&
				settingsState.appearance.editorFont
				? `${settingsState.appearance.editorFont} !important`
				: 'Menlo !important'
		},
		fontFamily() {
			return this.settingsState &&
				this.settingsState.appearance &&
				this.settingsState.appearance.font
				? `${this.settingsState.appearance.font} !important`
				: 'Roboto !important'
		},
		treeEditor() {
			return this.tab.treeEditor
		},
		currentValue() {
			let first = undefined
			this.treeEditor.forEachSelection((selection) => {
				if (!selection.getTree().parent) return

				let current
				try {
					if (selection instanceof TreeValueSelection)
						current = selection.getTree().value
					else current = selection.getTree().key
				} catch {}

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
			if (this.triggerCooldown || !this.isUserControlledTrigger) {
				if (!this.isUserControlledTrigger)
					this.$nextTick(() => (this.keyToAdd = ''))
				return
			}

			if (!suggestion) return this.onTriggerCooldown()

			const { type = 'object', value = suggestion } = suggestion

			if (type === 'snippet') {
				this.treeEditor.addFromJSON(value[1])
			} else {
				this.treeEditor.addKey(value, type)
			}

			this.$nextTick(() => (this.keyToAdd = ''))

			this.onTriggerCooldown()
		},
		onAddValue(suggestion) {
			if (this.triggerCooldown || !this.isUserControlledTrigger) {
				if (!this.isUserControlledTrigger)
					this.$nextTick(() => (this.valueToAdd = ''))
				return
			}

			if (!suggestion) return this.onTriggerCooldown()

			const { type = 'value', value = suggestion } = suggestion

			this.treeEditor.addValue(value, type)

			this.$nextTick(() => (this.valueToAdd = ''))

			this.onTriggerCooldown()
		},
		onTriggerCooldown() {
			if (this.triggerCooldown) return

			setTimeout(() => {
				this.triggerCooldown = false
			}, 100)
			this.triggerCooldown = true
		},
		mayTrigger() {
			if (this.isUserControlledTrigger) return

			setTimeout(() => {
				this.isUserControlledTrigger = false
			}, 100)
			this.isUserControlledTrigger = true
		},
		onScroll(event) {
			this.treeEditor.scrollTop = event.target.scrollTop
		},
		getIcon(item) {
			switch (item.type) {
				case 'object':
					return 'mdi-code-json'
				case 'array':
					return 'mdi-code-brackets'
				case 'value':
					return 'mdi-alphabetical'
				case 'arrayValue':
					return 'mdi-link-variant'
				case 'snippet':
					return 'mdi-attachment'
				default:
					return 'mdi-text'
			}
		},
	},
	watch: {
		'tab.uuid'() {
			this.treeEditor.receiveContainer(this.$refs.editorContainer)
		},
		propertySuggestions() {
			if (
				!this.$refs.addKeyInput ||
				!this.$refs.addValueInput ||
				!this.$refs.editValueInput
			)
				return

			if (
				this.propertySuggestions.length === 0 &&
				this.valueSuggestions.length > 0
			) {
				this.$refs.editValueInput.blur()
				this.$refs.addKeyInput.blur()
				this.$refs.addValueInput.focus()
			} else if (this.propertySuggestions.length > 0) {
				this.$refs.editValueInput.blur()
				this.$refs.addValueInput.blur()
				this.$refs.addKeyInput.focus()
			} else if (
				this.treeEditor.selections.some(
					(sel) => sel.tree instanceof PrimitiveTree
				)
			) {
				this.$refs.addKeyInput.blur()
				this.$refs.addValueInput.blur()
				this.$refs.editValueInput.focus()
			}
		},
	},
}
</script>

<style>
.tree-editor-selection {
	border-radius: 4px;
	background: var(--v-lineHighlightBackground-base);
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
