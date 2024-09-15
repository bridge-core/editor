export const colorNames = [
	'primary',

	'accent',
	'accentSecondary',

	'error',
	'info',
	'warning',
	'success',

	'text',
	'textSecondary',

	'background',
	'backgroundSecondary',
	'backgroundTertiary',

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
	font?: string
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
