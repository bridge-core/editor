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
			class="w-10 h-10 rounded-full shadow-lg transition-transform ease-in-out duration-200"
			classList={{
				'opacity-50 cursor-default': isDisabled(),
				'active:scale-[.95]': !isDisabled(),
			}}
			onClick={() => (props.disabled ? undefined : props.onClick())}
		>
			<span class="flex items-center justify-center">
				<SolidIcon icon={props.icon} size={props.size} />
			</span>
		</button>
	)
}
