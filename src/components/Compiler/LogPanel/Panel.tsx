import { Component, For } from 'solid-js'
import { toSignal } from '../../Solid/toSignal'
import { CompilerWindow } from '../Window/Window'
import { ILogData } from '../Worker/Console'

export const LogPanel: Component<{
	compilerWindow: CompilerWindow
}> = (props) => {
	console.log(props.compilerWindow.getCategories())
	const [log] = toSignal<[string, ILogData][]>(
		props.compilerWindow.getCategories().logs.data
	)

	return (
		<>
			<For each={log()}>
				{([logEntry, { time, type }]) => (
					<div>
						<span class="text--disabled font-weight-medium mr-1">
							[{time}]
						</span>
						<span>{logEntry}</span>
					</div>
				)}
			</For>
		</>
	)
}
