import { Component, createSignal, onMount, JSX, onCleanup } from 'solid-js'
import { Signal } from '../../Common/Event/Signal'
import { createRef } from '../SolidRef'
import { App } from '/@/App'

export const WindowComponent: Component<{
	children: JSX.Element
	currentWindow: SolidWindow<any>
}> = (props) => {
	const window = () => props.currentWindow
	let dialog: HTMLDialogElement | undefined = undefined
	const [shouldClose, setShouldClose] = createSignal(false)

	let delayedClose = false
	const onClose = (event?: Event) => {
		if (delayedClose) return

		// Prevent closing from ESC to show our close animation first
		if (event) event.preventDefault()
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
	}
	const onClickOutside = (event: any) => {
		if (event.target.tagName !== 'DIALOG')
			//This prevents issues with forms
			return

		const rect = event.target.getBoundingClientRect()

		const clickedInDialog =
			rect.top <= event.clientY &&
			event.clientY <= rect.top + rect.height &&
			rect.left <= event.clientX &&
			event.clientX <= rect.left + rect.width

		if (clickedInDialog === false) {
			onClose()
		}
	}

	onMount(() => {
		window().openEvent.on(() => {
			// @ts-ignore
			dialog?.showModal()
		})
		window().closeEvent.on(() => {
			// @ts-ignore
			dialog?.close()
		})

		dialog?.addEventListener('cancel', onClose)
		dialog?.addEventListener('click', onClickOutside)
	})

	onCleanup(() => {
		dialog?.removeEventListener('cancel', onClose)
		dialog?.removeEventListener('click', onClickOutside)
		window().openEvent.disposeListeners()
		window().closeEvent.disposeListeners()
	})

	return (
		<>
			<dialog
				class="
                    m-auto
                    rounded-lg
                    shadow-xl
                    backdrop:bg-neutral-700/25
                    backdrop:backdrop-blur-xs
                    
                    align-middle
                    dark:bg-neutral-900
                    dark:text-neutral-300
                    select-none
                "
				classList={{
					'open:animate-fade-in-and-scale-up open:backdrop:animate-fade-in':
						!shouldClose(),
					'animate-fade-out-and-scale-down backdrop:animate-fade-out':
						shouldClose(),
				}}
				ref={dialog}
			>
				{props.children}
			</dialog>
		</>
	)
}

export class SolidWindow<T = {}> {
	public readonly isOpen = createRef(true)
	public openEvent = new Signal<void>()
	public closeEvent = new Signal<void>()
	protected _disposeSelf: (() => void) | null = null

	constructor(
		protected component: Component<T>,
		protected props: T = {} as T
	) {
		this.open()
	}

	get windowComponent(): Component {
		return () => (
			<WindowComponent currentWindow={this}>
				{this.component(this.props)}
			</WindowComponent>
		)
	}

	open() {
		this._disposeSelf = App.solidWindows.addWindow(this).dispose

		this.openEvent.dispatch()
		this.closeEvent.resetSignal()
	}
	close() {
		this.closeEvent.dispatch()
		this.openEvent.resetSignal()
		this._disposeSelf?.()
		this._disposeSelf = null
	}
}
