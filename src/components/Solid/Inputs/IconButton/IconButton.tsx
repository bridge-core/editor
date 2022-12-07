import { Component } from 'solid-js'
import { useRipple } from '../../Directives/Ripple/Ripple'
import { SolidIcon } from '../../Icon/SolidIcon'
import './IconButton.css'

interface IconButtonProps {
	icon: string
	disabled?: boolean
	size?: 'small' | 'medium' | 'large' | number
	onClick: () => void
}

export const SolidIconButton: Component<IconButtonProps> = (props) => {
	const ripple = useRipple()

	return (
		<button
			use:ripple={!props.disabled}
			class="solid-icon-button d-flex align-center justify-center rounded-circle"
			classList={{ 'solid-icon-button-disabled': props.disabled }}
			onClick={props.onClick}
		>
			<SolidIcon icon={props.icon} size={props.size} />
		</button>
	)
}
