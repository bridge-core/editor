import { Component, For, Show } from 'solid-js'
import { SolidIcon } from '../../Solid/Icon/SolidIcon'
import { toSignal } from '../../Solid/toSignal'
import { CompilerWindow } from '../Window/Window'
import { ILogData } from '../Worker/Console'

export const LogPanel: Component<{
	compilerWindow: CompilerWindow
}> = (props) => {
	const [log] = toSignal<[string, ILogData][]>(
		props.compilerWindow.getCategories().logs.data
	)

	const icon = (type: string | undefined) => {
		if (type === 'info') return 'mdi-information-outline'
		if (type === 'warning') return 'mdi-alert-outline'
		if (type === 'error') return 'mdi-alert-circle-outline'

		return null
	}

	return (
		<>
			<Show when={!log() || log().length === 0}>
				<div class="mx-2 text--disabled">No logs to show...</div>
			</Show>

			<For each={log()}>
				{([logEntry, { time, type }]) => (
					<div class="d-flex align-top">
						<span class="text--disabled font-weight-medium mr-1">
							[{time}]
						</span>

						<Show when={icon(type)}>
							<SolidIcon
								class="pr-1"
								size={1.2}
								offsetY={-0.1}
								icon={icon(type)!}
								color={type}
							/>
						</Show>

						<span
							classList={{
								[`${type}--text`]: !!type,
							}}
						>
							{logEntry}
						</span>
					</div>
				)}
			</For>
		</>
	)
}
