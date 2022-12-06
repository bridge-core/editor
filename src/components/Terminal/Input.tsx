import { Component, createSignal } from 'solid-js'
import { TextField } from '../Solid/Inputs/TextField/TextField'
import { toSignal } from '../Solid/toSignal'
import type { Terminal } from './Terminal'

export const TerminalInput: Component<{
	terminal: Terminal
}> = (props) => {
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
			placeholder="Enter command..."
			model={[input, setInput]}
			onEnter={onEnter}
			disabled={hasRunningTask()}
		/>
	)
}
