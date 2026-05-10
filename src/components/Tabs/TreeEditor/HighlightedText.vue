<script setup lang="ts">
import { ComputedRef, computed } from 'vue'
import { keyword } from 'color-convert'
import { ThemeManager } from '@/libs/theme/ThemeManager'

const props = defineProps<{ value: string; type: String; knownWords: Record<string, string[]> }>()

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

const atoms = ['true', 'false', 'null']

function parse(): { word: string; color?: string }[] {
	if (props.type === 'string') {
		if (props.knownWords.variables.includes(props.value))
			return [{ word: props.value, color: getColor('variable') }]
		if (props.knownWords.typeIdentifiers.includes(props.value))
			return [{ word: props.value, color: getColor('type') }]

		if (props.value.includes(':')) {
			let newTokens = []

			const pieces = props.value.split(':')

			for (let pieceIndex = 0; pieceIndex < pieces.length; pieceIndex++) {
				const piece = pieces[pieceIndex]

				if (props.knownWords.keywords.includes(piece)) {
					newTokens.push({ word: piece, color: getColor('keyword') })
				} else {
					newTokens.push({ word: piece, color: getColor('string') })
				}

				if (pieceIndex !== pieces.length - 1) newTokens.push({ word: ':' })
			}

			return newTokens
		}

		return [{ word: props.value, color: getColor('string') }]
	}

	if (atoms.includes(props.value)) return [{ word: props.value, color: getColor('atom') }]

	if (props.type === 'number') return [{ word: props.value, color: getColor('number') }]

	return [{ word: props.value }]
}

const tokens: ComputedRef<{ word: string; color?: string }[]> = computed(() => parse())
</script>

<template>
	<span>
		<span v-for="token in tokens" :style="{ color: token.color }">{{ token.word }}</span>
	</span>
</template>
