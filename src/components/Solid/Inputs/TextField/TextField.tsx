import { Accessor, Component, Setter, Show } from 'solid-js'
import { useModel } from '../../Directives/Model/Model'
import { SolidIcon } from '../../Icon/SolidIcon'

interface TextFieldProps {
	class?: string
	classList?: Record<string, boolean>
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
			class="
				flex
				rounded
				items-center
				border
				border-[#bbb]
				focus-within:border-primary
				focus-within:text-primary
				focus-within:ring-1
				focus-within:ring-primary
				caret-primary
				transition-colors
				ease-in-out
				duration-100
			"
			classList={{
				'opacity-50': props.disabled,
				['' + props.class]: !!props.class,
				...(props.classList ?? {}),
			}}
		>
			<Show when={props.prependIcon}>
				<SolidIcon icon={props.prependIcon!} />
			</Show>

			<input
				class="flex-1 outline-none p-2"
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
