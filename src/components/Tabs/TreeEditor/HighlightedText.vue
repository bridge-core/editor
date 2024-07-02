<script setup lang="ts">
import { Ref, onMounted, ref } from 'vue'
import { keyword } from 'color-convert'
import { ThemeManager } from '@/libs/theme/ThemeManager'

const { value, type, knownWords }: { value: string; type: String; knownWords: Record<string, string[]> } = defineProps({
	knownWords: {
		type: Object,
		required: true,
	},
	value: {
		type: String,
		required: true,
	},
	type: {
		type: String,
		required: true,
	},
})

function convertColor(color: string): string {
	if (!color) return color

	if (color.startsWith('#')) {
		if (color.length === 4) {
			return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`
		}
		return color
	}

	return '#' + keyword.hex(color as any)
}

function getColor(name: string): string {
	const currentTheme = ThemeManager.get(ThemeManager.currentTheme)

	return convertColor(
		//@ts-ignore  Typescript doesn't like indexing the colors for some reason
		currentTheme.colors[<any>name] ??
			(currentTheme.highlighter && currentTheme.highlighter[name]
				? currentTheme.highlighter[name].color
				: undefined) ??
			'red'
	)
}

const tokens: Ref<{ word: string; color?: string }[]> = ref([])

const atoms = ['true', 'false', 'null']

function parse(): { word: string; color?: string }[] {
	if (type === 'string') {
		if (knownWords.variables.includes(value)) return [{ word: value, color: getColor('variable') }]
		if (knownWords.typeIdentifiers.includes(value)) return [{ word: value, color: getColor('type') }]

		if (value.includes(':')) {
			let newTokens = []

			const pieces = value.split(':')

			for (let pieceIndex = 0; pieceIndex < pieces.length; pieceIndex++) {
				const piece = pieces[pieceIndex]

				if (knownWords.keywords.includes(piece)) {
					newTokens.push({ word: piece, color: getColor('keyword') })
				} else {
					newTokens.push({ word: piece, color: getColor('string') })
				}

				if (pieceIndex !== pieces.length - 1) newTokens.push({ word: ':' })
			}

			return newTokens
		}

		return [{ word: value, color: getColor('string') }]
	}

	if (atoms.includes(value)) return [{ word: value, color: getColor('atom') }]

	return [{ word: value }]
}

onMounted(() => {
	tokens.value = parse()
})
</script>

<template>
	<span>
		<span v-for="token in tokens" :style="{ color: token.color }">{{ token.word }}</span>
	</span>
</template>
