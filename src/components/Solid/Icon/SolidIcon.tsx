import { Component } from 'solid-js'
import { toVue } from '../toVue'

interface SolidIconProps {
	icon: string
	size?: 'sm' | 'md' | 'lg' | number
	color?: string
	opacity?: number
	onClick?: () => void
	children?: string // Compat with Vuetify's v-icon which allows passing icon id as slot content
}

/**
 * A solid component which renders a mdi icon
 */
export const SolidIcon: Component<SolidIconProps> = (props) => {
	const icon = () => props.children?.trim() ?? props.icon
	const iconSize = () => {
		switch (props.size) {
			case 'sm':
				return '1rem'
			case 'md':
				return '2rem'
			case 'lg':
				return '3rem'
			default:
				return undefined
		}
	}

	const classList = () => ({
		[`mdi ${icon().startsWith('mdi-') ? icon() : `mdi-${icon()}`}`]: true,
		'cursor-pointer': !!props.onClick,
		[`${props.color}--text`]: !!props.color,
	})

	return (
		<i
			style={{ 'font-size': iconSize(), opacity: props.opacity ?? 1 }}
			translate="no"
			classList={classList()}
			onClick={props.onClick}
		/>
	)
}

export const VIcon = toVue(SolidIcon)
