import { Component, For, Show } from 'solid-js'
import { SolidIcon } from '../../Solid/Icon/SolidIcon'
import { toSignal } from '../../Solid/toSignal'
import type { Terminal } from './Terminal'

export const TerminalOutput: Component<{
	terminal: Terminal
}> = (props) => {
	const [output] = toSignal(props.terminal.output)
	const [cwd] = toSignal(props.terminal.cwd)

	const prettyCwd = () => {
		const tmp = cwd()
			.replace(props.terminal.baseCwd, '')
			.replace(/\\/g, '/')
		if (tmp === '') return 'bridge'
		return `bridge${tmp}`
	}

	return (
		<>
			{/* Show current cwd */}
			<span class="terminal-line d-flex align-center font-weight-medium primary--text">
				<Show when={prettyCwd() !== ''}>
					<SolidIcon icon="mdi-folder-open-outline" class="mr-1" />
				</Show>

				{prettyCwd()}
			</span>

			{/* Render terminal output */}
			<div class="terminal-output-container pb-2">
				<For each={output()}>
					{({ kind, time, currentCwdName, msg }, i) => (
						<div
							class="terminal-line"
							classList={{ 'mb-0': i() + 1 !== output().length }}
						>
							<span class="text--disabled mr-1">[{time}]</span>
							<span
								class="terminal-line"
								classList={{
									'error--text': kind === 'stderr',
									'text--secondary': kind === 'stdout',
									'font-weight-medium': kind === 'stdin',
								}}
							>
								<Show when={kind === 'stdin'}>
									{currentCwdName}&nbsp;&#62;&nbsp;
								</Show>
								{msg}
							</span>
						</div>
					)}
				</For>
			</div>
		</>
	)
}
