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
	'behaviorPack',
	'resourcePack',
	'worldTemplate',
	'skinPack',
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
