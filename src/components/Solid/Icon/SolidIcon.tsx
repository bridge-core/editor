import { Component } from 'solid-js'
import { toVue } from '../toVue'

interface SolidIconProps {
	icon: string
	class?: string
	size?: 'small' | 'medium' | 'large' | number
	offsetY?: number
	color?: string
	opacity?: number
	onClick?: () => unknown
	children?: string // Compat with Vuetify's v-icon which allows passing icon id as slot content
}

/**
 * A solid component which renders a mdi icon
 */
export const SolidIcon: Component<SolidIconProps> = (props) => {
	const icon = () => props.children?.trim() ?? props.icon
	const iconSize = () => {
		switch (props.size) {
			case 'small':
				return '1rem'
			case 'medium':
				return '1.4rem'
			case 'large':
				return '2rem'
			default:
				return props.size ? `${props.size}rem` : '1.4rem'
		}
	}

	const classList = () => ({
		[`mdi ${icon().startsWith('mdi-') ? icon() : `mdi-${icon()}`}`]: true,
		'cursor-pointer': !!props.onClick,
		[`${props.color}--text`]: !!props.color,
	})

	return (
		<i
			style={{
				'font-size': iconSize(),
				opacity: props.opacity ?? 1,
				transform: props.offsetY
					? `translate(0, ${props.offsetY}em)`
					: undefined,
			}}
			translate="no"
			class={props.class}
			classList={classList()}
			onClick={props.onClick}
		/>
	)
}

export const VIcon = toVue(SolidIcon)
