import { Accessor, Component, Setter, Show } from 'solid-js'
import { useModel } from '../../Directives/Model/Model'
import { SolidIcon } from '../../Icon/SolidIcon'
import './TextField.css'

interface TextFieldProps {
	class?: string
	disabled?: boolean
	model?: [Accessor<string>, Setter<string>]
	prependIcon?: string
	placeholder?: string

	onEnter?: (input: string) => void
}

export const TextField: Component<TextFieldProps> = (props) => {
	const model = useModel()
	const onKeyDown = (event: KeyboardEvent) => {
		if (event.key === 'Enter') {
			props.onEnter?.((event.target as HTMLInputElement).value)
		}
	}

	return (
		<div
			class="solid-text-field"
			classList={{
				['' + props.class]: !!props.class,
			}}
		>
			<Show when={props.prependIcon}>
				<SolidIcon icon={props.prependIcon!} />
			</Show>

			<input
				use:model={props.model}
				placeholder={props.placeholder}
				onKeyDown={onKeyDown}
				type="text"
				spellcheck={false}
				disabled={props.disabled}
			/>
		</div>
	)
}
