import { Component } from 'solid-js'
import { useRipple } from '../Directives/Ripple/Ripple'
import { SolidIcon } from './SolidIcon'

interface IconTextProps {
	icon: string
	text: string
	opacity?: number
	color?: string
}

/**
 * A component that displays text with an icon next to it
 */
export const IconText: Component<IconTextProps> = (props) => {
	const ripple = useRipple()
	const styles = {
		'white-space': 'nowrap',
		overflow: 'hidden',
		'text-overflow': 'ellipsis',
		width: '100%',
	} as const

	return (
		<div use:ripple class="rounded" style={styles}>
			<SolidIcon
				icon={props.icon}
				color={props.color}
				opacity={props.opacity}
			/>
			<span class="ml-1">{props.text}</span>
		</div>
	)
}
