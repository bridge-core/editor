import { onCleanup } from 'solid-js'
import './Ripple.css'

declare module 'solid-js' {
	namespace JSX {
		interface Directives {
			ripple: true
		}
	}
}

function rippleDirective(el: HTMLElement) {
	let spans = new Set<HTMLSpanElement>()
	const onClick = (event: MouseEvent) => {
		el.classList.add('solid-ripple-container')
		const bounds = el.getBoundingClientRect()
		const x = event.pageX
		const y = event.pageY

		const fromTop = y - bounds.top
		const fromBottom = bounds.height - fromTop
		const fromLeft = x - bounds.left
		const fromRight = bounds.width - fromLeft

		const rippleDimension =
			Math.ceil(Math.max(fromRight, fromLeft, fromTop, fromBottom)) * 2

		const span = generateRipple(
			fromLeft - rippleDimension,
			fromTop - rippleDimension,
			rippleDimension
		)

		el.appendChild(span)

		// Logic for cleaning up the span outside of normal lifecycle
		spans.add(span)

		el.addEventListener('animationend', () => {
			if (!spans.has(span)) return
			span.remove()
			spans.delete(span)

			if (spans.size === 0) el.classList.remove('solid-ripple-container')
		})
	}

	el.addEventListener('click', onClick)

	onCleanup(() => {
		el.removeEventListener('click', onClick)
		el.classList.remove('solid-ripple-container')

		spans.forEach((span) => span.remove())
		spans = new Set()
	})
}

function generateRipple(x: number, y: number, rippleDimensions: number) {
	const span = document.createElement('span')
	span.classList.add('solid-ripple')

	span.style.width = `${rippleDimensions}px`
	span.style.height = `${rippleDimensions}px`
	span.style.borderRadius = `${rippleDimensions}px`

	span.style.left = `${x}px`
	span.style.top = `${y}px`

	return span
}

export const useRipple = () => rippleDirective
