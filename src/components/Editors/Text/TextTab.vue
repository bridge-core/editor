<template>
	<div ref="monacoContainer" style="height: calc(100% - 48px); width: 100%" />
</template>

<script>
import * as monaco from 'monaco-editor'
import { TextTab } from './TextTab'

const editorInstances = []
export default {
	name: 'TextTab',
	props: {
		tab: Object,
		id: {
			type: Number,
			default: 0,
		},
	},
	computed: {
		isDarkMode() {
			return this.$vuetify.theme.dark
		},
		fontSize() {
			return /** this.$store.state.Settings.file_font_size || */ '14px'
		},
		fontFamily() {
			return /** this.$store.state.Settings.file_font_family || */ '14px'
		},
	},
	activated() {
		this.updateEditor()
	},
	deactivated() {
		this.tab.editorInstance?.dispose()
		this.tab.editorInstance = undefined
	},
	mounted() {
		this.updateEditor()
	},
	methods: {
		updateEditor() {
			monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
				target: monaco.languages.typescript.ScriptTarget.ESNext,
				allowNonTsExtensions: true,
				noLib: true,
				alwaysStrict: true,
			})

			if (!this.tab.editorInstance) {
				editorInstances[this.id]?.dispose()
				editorInstances[this.id] = monaco.editor.create(
					this.$refs.monacoContainer,
					{
						theme: `bridgeMonacoDefault`,
						roundedSelection: false,
						autoIndent: 'full',
						fontSize: this.fontSize,
						// fontFamily: this.fontFamily,
						tabSize: 4,
					}
				)

				if (this.tab instanceof TextTab)
					this.tab.receiveEditorInstance(editorInstances[this.id])
			}

			editorInstances[this.id]?.layout()
		},
	},
	watch: {
		tab() {
			if (this.tab instanceof TextTab)
				this.tab.receiveEditorInstance(editorInstances[this.id])
		},
		fontSize(val) {
			this.monacoEditor.updateOptions({
				fontSize: this.fontSize,
			})
		},
		fontFamily(val) {
			this.monacoEditor.updateOptions({
				fontFamily: this.fontFamily,
			})
		},
	},
}
</script>

<style>
.monaco-action-bar {
	background: var(--v-menu-base) !important;
}
.action-item.focused > a {
	background: var(--v-primary-base) !important;
}
</style>
