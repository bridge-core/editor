let clipboard: any = undefined

/**
 * Sets a virtual clipboard
 * @param value
 */
export function setClipboard(value: any) {
	clipboard = value
}

/**
 * Gets the virtual clipboard value
 * @param value
 */
export function getClipboard(): any {
	return clipboard
}
