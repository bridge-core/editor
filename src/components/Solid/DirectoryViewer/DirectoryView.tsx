import { Dynamic, Show, Switch, Match, For } from 'solid-js/web'
import { toSignal } from '../toSignal'
import { Name } from './Common/Name'
import { DirectoryWrapper } from '/@/components/UIElements/DirectoryViewer/DirectoryView/DirectoryWrapper'

interface DirectoryViewProps {
	hideDirectoryName?: boolean
	directoryWrapper: DirectoryWrapper
}

export function DirectoryView(props: DirectoryViewProps) {
	const [children] = toSignal(props.directoryWrapper.children)
	const [open] = toSignal(props.directoryWrapper.isOpen)

	return (
		<Dynamic
			component={props.hideDirectoryName ? 'div' : 'details'}
			open={open()}
		>
			<Show when={!props.hideDirectoryName}>
				<Name tagName="summary" baseWrapper={props.directoryWrapper} />
			</Show>

			<div class="ml-2">
				<For each={children()}>
					{(child) => (
						<Switch
							fallback={
								<span>
									Unknown directory entry kind: "{child.kind}"
								</span>
							}
						>
							<Match when={child.kind === 'directory'}>
								<DirectoryView
									directoryWrapper={child as DirectoryWrapper}
								/>
							</Match>

							<Match when={child.kind === 'file'}>
								<Name tagName="div" baseWrapper={child} />
							</Match>
						</Switch>
					)}
				</For>
			</div>
		</Dynamic>
	)
}
