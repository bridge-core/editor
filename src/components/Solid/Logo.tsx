import { Component } from 'solid-js'
import { isNightly } from '/@/libs/app/isNightly'

export const SolidBridgeLogo: Component<{
	class: string
}> = (props) => {
	const logoPath = isNightly
		? `/img/icons/nightly/favicon.svg`
		: `/img/icons/favicon.svg`

	return (
		<img
			class={props.class}
			draggable={false}
			src={logoPath}
			alt="Logo of bridge. v2"
		/>
	)
}
