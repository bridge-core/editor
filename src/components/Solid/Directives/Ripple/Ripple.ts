import { onCleanup } from 'solid-js'
import './Ripple.css'

declare module 'solid-js' {
	namespace JSX {
		interface Directives {
			ripple: any
		}
	}
}

function rippleDirective(el: HTMLElement, value: () => boolean) {
	el.classList.add('solid-ripple-container')

	let span: HTMLElement | null = null
	const onPointerDown = (event: MouseEvent) => {
		if (span) {
			reset()
		}
		if (typeof value === 'function' && !value()) return

		const bounds = el.getBoundingClientRect()
		const x = event.pageX
		const y = event.pageY

		const fromTop = y - bounds.top
		const fromBottom = bounds.height - fromTop
		const fromLeft = x - bounds.left
		const fromRight = bounds.width - fromLeft

		const rippleDimension =
			Math.ceil(Math.max(fromRight, fromLeft, fromTop, fromBottom)) * 2.3

		span = generateRipple(
			fromLeft - rippleDimension,
			fromTop - rippleDimension,
			rippleDimension
		)

		el.appendChild(span)
	}

	let mayStartFadeOut = false
	let pointerAlreadyUp = false
	const onPointerUp = (event: MouseEvent) => {
		if (!span) return

		if (mayStartFadeOut) {
			span.classList.add('solid-ripple-fade-out')
		} else {
			pointerAlreadyUp = true
		}
	}

	const reset = () => {
		span?.remove()
		span = null
		mayStartFadeOut = false
		pointerAlreadyUp = false
	}

	el.addEventListener('animationend', (event) => {
		if (!span) return

		if (event.animationName === 'solid-ripple-scale-up') {
			mayStartFadeOut = true

			if (pointerAlreadyUp) {
				span.classList.add('solid-ripple-fade-out')
			}
		} else if (event.animationName === 'solid-ripple-fade-out') {
			reset()
		}
	})

	el.addEventListener('pointerdown', onPointerDown)
	window.addEventListener('pointerup', onPointerUp)

	onCleanup(() => {
		el.removeEventListener('click', onPointerDown)
		window.removeEventListener('pointerup', onPointerUp)
		el.classList.remove('solid-ripple-container')

		reset()
	})
}

function generateRipple(x: number, y: number, rippleDimensions: number) {
	const span = document.createElement('span')
	span.classList.add('solid-ripple', 'solid-ripple-active')

	span.style.width = `${rippleDimensions}px`
	span.style.height = `${rippleDimensions}px`
	span.style.borderRadius = `${rippleDimensions}px`

	span.style.left = `${x}px`
	span.style.top = `${y}px`

	return span
}

export const useRipple = () => rippleDirective
