import { Component } from 'solid-js'
import { useRipple } from '../../Directives/Ripple/Ripple'
import { SolidIcon } from '../../Icon/SolidIcon'

interface IconButtonProps {
	icon: string
	disabled?: boolean
	size?: 'small' | 'medium' | 'large' | number
	onClick: () => void
}

export const SolidIconButton: Component<IconButtonProps> = (props) => {
	const ripple = useRipple()

	const isDisabled = () => props.disabled ?? false

	return (
		<button
			use:ripple={!isDisabled()}
			class="
				w-10
				h-10
				rounded-full
				focus:outline-none
				transition-transform
				ease-in-out
				duration-200
				disabled:opacity-50
				disabled:cursor-default
				enabled:active:scale-[.95]
				enabled:focus:scale-110
				enabled:hover:scale-110
			"
			disabled={isDisabled()}
			onClick={() => (props.disabled ? undefined : props.onClick())}
		>
			<span class="flex items-center justify-center">
				<SolidIcon icon={props.icon} size={props.size} />
			</span>
		</button>
	)
}
