interface SolidIconProps {
	icon: string
	size?: 'sm' | 'md' | 'lg' | number
	color?: string
	opacity?: number
	onClick?: () => void
}

/**
 * A solid component which renders a mdi icon
 */
export function SolidIcon(props: SolidIconProps) {
	const iconSize = () => {
		switch (props.size) {
			case 'sm':
				return '1rem'
			case 'md':
				return '2rem'
			case 'lg':
				return '3rem'
			default:
				return props.size ? props.size + 'rem' : '1rem'
		}
	}

	const classList = () => ({
		[`mdi ${
			props.icon.startsWith('mdi-') ? props.icon : `mdi-${props.icon}`
		}`]: true,
		'cursor-pointer': !!props.onClick,
		[`${props.color}--text`]: !!props.color,
	})

	return (
		<span
			style={{ 'font-size': iconSize(), opacity: props.opacity ?? 1 }}
			classList={classList()}
			onClick={props.onClick}
		/>
	)
}
