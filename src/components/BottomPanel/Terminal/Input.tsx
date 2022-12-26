import { Component, createSignal, Show } from 'solid-js'
import { useTranslations } from '../../Composables/useTranslations'
import { SolidIcon } from '../../Solid/Icon/SolidIcon'
import { SolidButton } from '../../Solid/Inputs/Button/SolidButton'
import { SolidIconButton } from '../../Solid/Inputs/IconButton/IconButton'
import { TextField } from '../../Solid/Inputs/TextField/TextField'
import { toSignal } from '../../Solid/toSignal'
import type { Terminal } from './Terminal'

export const TerminalInput: Component<{
	terminal: Terminal
}> = (props) => {
	const { t } = useTranslations()
	const [input, setInput] = createSignal('')
	const [hasRunningTask] = toSignal(props.terminal.hasRunningTask)
	const [output, setOutput] = toSignal(props.terminal.output)

	const onEnter = () => {
		props.terminal.executeCommand(input())
		setInput('')
	}
	const clearOutput = () => {
		console.log('CLICK')
		setOutput([])
	}
	const hasOutput = () => output().length === 0

	return (
		<div class="d-flex align-center">
			<TextField
				class="flex-grow-1 my-2 mr-2"
				prependIcon="mdi-chevron-right"
				placeholder={t('bottomPanel.terminal.inputPlaceholder')}
				model={[input, setInput]}
				onEnter={onEnter}
				disabled={hasRunningTask()}
			/>
			<SolidButton onClick={() => console.log('HEY')}>
				<SolidIcon icon="mdi-test-tube" />
				Test
			</SolidButton>

			<SolidIconButton
				disabled={!hasRunningTask()}
				icon="mdi-close-octagon-outline"
				size={1.7}
				onClick={() => props.terminal.killCommand()}
			/>

			<SolidIconButton
				disabled={hasOutput()}
				icon="mdi-text-box-remove-outline"
				size={1.7}
				onClick={() => clearOutput()}
			/>
		</div>
	)
}
