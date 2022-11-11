<template>
	<span v-if="value === undefined" :style="toStyle(def)">
		<slot />
	</span>
	<span
		v-else
		v-intersect="skipRender ? onIntersect : null"
		style="white-space: nowrap"
	>
		<span v-if="skipRender">"{{ value }}"</span>

		<span v-else
			>"<template v-for="({ text, def }, i) in tokens">
				<span :key="text" :style="toStyle(def)">{{ text }}</span
				><span :key="`${text}.colon`">{{
					tokens.length > i + 1 ? ':' : ''
				}}</span> </template
			>"</span
		>
	</span>
</template>

<script>
import { HighlighterMixin } from '/@/components/Mixins/Highlighter'
import { App } from '/@/App'
import { reactive } from 'vue'

const knownWords = new reactive({
	keywords: [],
	typeIdentifiers: [],
	variables: [],
	definitions: [],
})

setTimeout(() => {
	App.getApp().then((app) =>
		app.configuredJsonLanguage
			.getHighlighter()
			.on(({ keywords, typeIdentifiers, variables, definitions }) => {
				knownWords.keywords = keywords
				knownWords.typeIdentifiers = typeIdentifiers
				knownWords.variables = variables
				knownWords.definitions = definitions
			})
	)
})

export default {
	props: {
		def: Object,
		value: String,
	},
	mixins: [
		HighlighterMixin([
			'string',
			'variable',
			'definition',
			'keyword',
			'type',
		]),
	],
	setup() {
		return {
			knownWords,
		}
	},
	data: () => ({
		skipRender: true,
	}),
	computed: {
		tokens() {
			return this.value.split(':').map((token) => ({
				text: token,
				def: this.getDefinition(token),
			}))
		},
	},
	methods: {
		getDefinition(text) {
			if (this.knownWords.keywords.includes(text)) return this.keywordDef
			else if (this.knownWords.typeIdentifiers.includes(text))
				return this.typeDef
			else if (this.knownWords.variables.includes(text))
				return this.variableDef
			else if (this.knownWords.definitions.includes(text))
				return this.definitionDef
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
		onIntersect(entries) {
			// Once we have rendered a highlight once, we no longer revert to the unhighlighted text
			// TODO: Maybe this logic can be improved? (e.g. a timeout to revert to the unhighlighted text)
			if (!this.skipRender) return

			const isIntersecting = !entries[0].isIntersecting
			this.skipRender = isIntersecting
		},
	},
}
</script>
