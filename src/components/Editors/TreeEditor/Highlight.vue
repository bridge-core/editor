<template>
	<span v-if="value === undefined" :style="toStyle(def)"><slot /></span>

	<span v-else
		>"<template v-for="({ text, def }, i) in tokens">
			<span :key="text" :style="toStyle(def)">{{ text }}</span
			><span :key="`${text}.colon`">{{
				tokens.length > i + 1 ? ':' : ''
			}}</span> </template
		>"</span
	>
</template>

<script>
import { HighlighterMixin } from '/@/components/Mixins/Highlighter'
import { App } from '/@/App'

export default {
	props: {
		def: Object,
		value: String,
	},
	mixins: [
		HighlighterMixin([
			'string',
			'number',
			'variable',
			'definition',
			'keyword',
			'type',
		]),
	],
	data: () => ({
		keywords: [],
		typeIdentifiers: [],
		variables: [],
		definitions: [],
	}),
	async mounted() {
		const app = await App.getApp()
		app.configuredJsonLanguage.getHighlighter().on(this.updateKnownWords)
		this.updateKnownWords(
			app.configuredJsonLanguage.getHighlighter().knownWords
		)
	},
	async destroyed() {
		const app = await App.getApp()
		app.configuredJsonLanguage.getHighlighter().on(this.updateKnownWords)
	},
	computed: {
		tokens() {
			return this.value.split(':').map((token) => ({
				text: token,
				def: this.getDefinition(token),
			}))
		},
	},
	methods: {
		updateKnownWords({
			keywords,
			typeIdentifiers,
			variables,
			definitions,
		}) {
			this.keywords = keywords
			this.typeIdentifiers = typeIdentifiers
			this.variables = variables
			this.definitions = definitions
		},

		getDefinition(text) {
			if (this.keywords.includes(text)) return this.keywordDef
			else if (this.typeIdentifiers.includes(text)) return this.typeDef
			else if (this.variables.includes(text)) return this.variableDef
			else if (this.definitions.includes(text)) return this.definitionDef
			else return this.stringDef
		},
		getTextDecoration(def) {
			if (!def) return null
			if (!def.textDecoration) def.textDecoration = ''

			if (def.isItalic) def.textDecoration += ' italic'
			return def.textDecoration
		},
		toStyle(def) {
			return {
				color: def ? def.color : null,
				backgroundColor: def ? def.background : null,
				textDecoration: this.getTextDecoration(def),
			}
		},
	},
}
</script>
