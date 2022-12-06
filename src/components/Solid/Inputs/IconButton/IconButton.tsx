import { Component } from 'solid-js'
import { useRipple } from '../../Directives/Ripple/Ripple'
import { SolidIcon } from '../../Icon/SolidIcon'
import './IconButton.css'

interface IconButtonProps {
	icon: string
	onClick: () => void
}

export const SolidIconButton: Component<IconButtonProps> = (props) => {
	const ripple = useRipple()

	return (
		<button
			use:ripple
			class="solid-icon-button rounded-circle"
			onClick={props.onClick}
		>
			<SolidIcon icon={props.icon} />
		</button>
	)
}
