import { Dynamic, Show } from 'solid-js/web'
import { IconText } from '../../Icon/IconText'
import { toSignal } from '../../toSignal'
import { BaseWrapper } from '/@/components/UIElements/DirectoryViewer/Common/BaseWrapper'
import './Name.css'
import { createSignal } from 'solid-js'
import { SolidIcon } from '../../Icon/SolidIcon'

export interface NameProps {
	tagName: 'summary' | 'div'
	baseWrapper: BaseWrapper<any>
}

export function Name(props: NameProps) {
	const [isSelected] = toSignal(props.baseWrapper.isSelected)
	const [isFocused, setIsFocused] = createSignal(false)

	const onFocus = (event: FocusEvent) => {
		setIsFocused(true)

		if (props.baseWrapper.isSelected.value) return
		select()
	}
	const select = () => {
		props.baseWrapper.unselectAll()
		props.baseWrapper.isSelected.value = true
	}
	const onClick = (event: MouseEvent) => {
		// Left click
		if (event.button === 0) {
			props.baseWrapper.onClick(event)
		} else if (event.button === 2) {
			props.baseWrapper.onRightClick(event)
		}
	}

	return (
		<Dynamic
			component={props.tagName}
			class="directory-viewer-name cursor-pointer d-flex align-center px-1 rounded-lg"
			classList={{
				selected: isSelected(),
			}}
			onClick={onClick}
			onFocus={(event: FocusEvent) => onFocus(event)}
			onBlur={() => setIsFocused(false)}
		>
			<IconText
				icon={props.baseWrapper.useIcon()}
				color={props.baseWrapper.color}
				text={props.baseWrapper.name}
			/>

			<Show when={isFocused()}>
				<SolidIcon
					color={props.baseWrapper.color}
					icon="mdi-circle-small"
				/>
			</Show>
		</Dynamic>
	)
}
