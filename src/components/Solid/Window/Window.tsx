import { Component, createSignal, onMount } from 'solid-js'
import { EventDispatcher } from '../../Common/Event/EventDispatcher'
import { Signal } from '../../Common/Event/Signal'
import { SolidIcon } from '../Icon/SolidIcon'
import { SolidButton } from '../Inputs/Button/SolidButton'
import { createRef } from '../SolidRef'
import { App } from '/@/App'

export const WindowComponent: Component<{ currentWindow: SolidWindow }> = (
	props
) => {
	const window = () => props.currentWindow
	let dialog: HTMLDialogElement | undefined = undefined
	const [shouldClose, setShouldClose] = createSignal(false)

	onMount(() => {
		window().openEvent.on(() => {
			dialog?.showModal()
		})
		window().closeEvent.on(() => {
			dialog?.close()
		})

		let delayedClose = false
		dialog?.addEventListener('close', () => {
			if (delayedClose) return

			dialog?.showModal()
			setShouldClose(true)

			dialog?.addEventListener(
				'animationend',
				() => {
					setShouldClose(false)
					delayedClose = true
					window().close()
				},
				{ once: true }
			)
		})
	})

	return (
		<>
			<dialog
				class="
                    m-auto
                    p-2
                    rounded-lg
                    shadow-xl
                    backdrop:bg-neutral-700/25
                    backdrop:backdrop-blur-xs
                    
                    align-middle
                    dark:bg-neutral-900
                    dark:text-neutral-300
                    
                "
				classList={{
					'open:animate-fade-in-and-scale-up open:backdrop:animate-fade-in':
						!shouldClose(),
					'animate-fade-out-and-scale-down backdrop:animate-fade-out':
						shouldClose(),
				}}
				ref={dialog}
			>
				<p>This is a test solid window</p>
				<form method="dialog">
					<SolidButton onClick={() => {}}>
						<SolidIcon icon="mdi-test-tube" />
						Test
					</SolidButton>
				</form>
			</dialog>
		</>
	)
}

export class SolidWindow {
	public readonly isOpen = createRef(true)
	public openEvent = new Signal<void>()
	public closeEvent = new Signal<void>()
	protected _disposeSelf: () => void

	constructor() {
		this._disposeSelf = App.solidWindows.addWindow(this).dispose

		this.open()
	}

	get component(): Component {
		return () => <WindowComponent currentWindow={this} />
	}

	open() {
		this.openEvent.dispatch()
		this.closeEvent.resetSignal()
	}
	close() {
		this.closeEvent.dispatch()
		this.openEvent.resetSignal()
		this._disposeSelf()
	}
}
