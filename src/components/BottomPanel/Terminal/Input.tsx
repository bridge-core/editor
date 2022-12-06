import { Component, createSignal } from 'solid-js'
import { useTranslations } from '../../Composables/useTranslations'
import { TextField } from '../../Solid/Inputs/TextField/TextField'
import { toSignal } from '../../Solid/toSignal'
import type { Terminal } from './Terminal'

export const TerminalInput: Component<{
	terminal: Terminal
}> = (props) => {
	const { t } = useTranslations()
	const [input, setInput] = createSignal('')
	const [hasRunningTask] = toSignal(props.terminal.hasRunningTask)

	const onEnter = () => {
		props.terminal.executeCommand(input())
		setInput('')
	}

	return (
		<TextField
			class="my-2"
			prependIcon="mdi-chevron-right"
			placeholder={t('bottomPanel.terminal.inputPlaceholder')}
			model={[input, setInput]}
			onEnter={onEnter}
			disabled={hasRunningTask()}
		/>
	)
}
