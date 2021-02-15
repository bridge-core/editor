<template>
	<div ref="monacoContainer" style="height:calc(100% - 48px); width: 100%;" />
</template>

<script>
import * as monaco from 'monaco-editor'

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
	mounted() {
		monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
			target: monaco.languages.typescript.ScriptTarget.ESNext,
			allowNonTsExtensions: true,
			noLib: true,
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

			this.tab.receiveEditorInstance(editorInstances[this.id])
		}

		editorInstances[this.id]?.layout()
	},
	watch: {
		tab() {
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
