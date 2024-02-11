export const colorNames = [
	'text',
	'textAlternate',

	'primary',
	'secondary',
	'accent',
	'error',
	'info',
	'warning',
	'success',

	'background',
	'menu',
	'menuAlternate',
	'menuAlternate2',

	'behaviorPack',
	'resourcePack',
	'worldTemplate',
	'skinPack',

	'expandedSidebar',
	'sidebarNavigation',
	'toolbar',
	'footer',
	'tooltip',
	'sidebarSelection',
	'scrollbarThumb',
	'tabActive',
	'tabInactive',
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
