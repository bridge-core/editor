import { JSX } from 'solid-js/types'
import { useRipple } from '../../Directives/Ripple/Ripple'

interface SolidButtonProps {
	children: JSX.Element | string
	color?: string
	onClick: () => void
}

export function SolidButton(props: SolidButtonProps) {
	const ripple = useRipple()

	return (
		<button
			use:ripple
			class="text-white p-2 py-1 overflow-hidden bg-primary rounded-lg shadow-lg active:scale-[.95] transition-transform ease-in-out duration-200"
			onClick={props.onClick}
		>
			<span class="flex items-center">{props.children}</span>
		</button>
	)
}
