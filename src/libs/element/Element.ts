export function isElementOrChild(
	element: HTMLElement | null,
	target: HTMLElement
) {
	while (element) {
		if (element === target) return true

		element = element.parentElement
	}

	return false
}
