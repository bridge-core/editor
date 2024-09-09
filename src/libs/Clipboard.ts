let clipboard: any = undefined

/**
 * @description Sets the clipboard value.
 * @param value The value to set.
 */
export function setClipboard(value: any) {
	clipboard = value
}

/**
 * @description Gets the clipboard value.
 * @returns The clipboard value.
 */
export function getClipboard(): any {
	return clipboard
}
