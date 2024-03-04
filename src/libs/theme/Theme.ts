export const colorNames = [
	'primary',
	'secondary',
	'error',
	'warning',
	'success',
	'accent',

	'text',
	'textAlternate',

	'background',

	'menu',
	'menuAlternate',

	'behaviorPack',
	'resourcePack',
	'worldTemplate',
	'skinPack',

	'toolbar',
	'lineHighlightBackground',
]

export interface Theme {
	id: string
	name: string
	colorScheme?: 'dark' | 'light'
	colors: Record<(typeof colorNames)[number], string>
	highlighter?: Record<
		string,
		{
			color?: string
			background?: string
			textDecoration?: string
			isItalic?: boolean
		}
	>
	monaco?: Record<string, string>
}
