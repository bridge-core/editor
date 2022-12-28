import { JSX } from 'solid-js/types'
import { useRipple } from '../../Directives/Ripple/Ripple'

interface SolidButtonProps {
	class?: string
	children: JSX.Element | string
	color?: string
	disabled?: boolean
	onClick: () => void
}

export function SolidButton(props: SolidButtonProps) {
	const ripple = useRipple()

	return (
		<button
			use:ripple
			class="
				p-2
				py-1
				overflow-hidden
				rounded-lg
				shadow-lg
				active:scale-[.95]
				focus:outline-none
				focus:-translate-y-[0.1rem]
				focus:shadow-xl
				hover:-translate-y-[0.1rem]
				hover:shadow-xl
				transition-transform
				ease-in-out
				duration-200
			"
			classList={{
				[props.class!]: !!props.class,
				[`text-white`]: props.color === 'primary',
			}}
			style={{
				'background-color': `var(--v-${props.color ?? 'toolbar'}-base)`,
			}}
			onClick={props.onClick}
			disabled={props.disabled}
		>
			<span class="flex items-center">{props.children}</span>
		</button>
	)
}
