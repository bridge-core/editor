import { JSX } from 'solid-js/types'

interface SolidButtonProps {
	children: JSX.Element[] | JSX.Element
	color?: string
	onClick: () => void
}

export function SolidButton(props: SolidButtonProps) {
	return <button onClick={props.onClick}>{props.children}</button>
}
