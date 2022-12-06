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
		<div class="my-2">
			{/* Show current cwd */}
			<span class="terminal-line d-flex align-center font-weight-medium primary--text">
				<Show when={prettyCwd() !== ''}>
					<SolidIcon icon="mdi-folder-open-outline" class="mr-1" />
				</Show>

				{prettyCwd()}
			</span>

			{/* Render terminal output */}
			<For each={output()}>
				{({ command, time, stdout, stderr }, i) => (
					<div classList={{ 'mb-2': i() + 1 !== output().length }}>
						<span class="font-weight-medium terminal-line">
							<span class="text--disabled mr-1">[{time}]</span>
							{command}
						</span>

						<div class="ml-4">
							<For each={stdout}>
								{(line) => (
									<div class="terminal-line">{line}</div>
								)}
							</For>

							<For each={stderr}>
								{(line) => (
									<div class="terminal-line error--text">
										{line}
									</div>
								)}
							</For>
						</div>
					</div>
				)}
			</For>
		</div>
	)
}
