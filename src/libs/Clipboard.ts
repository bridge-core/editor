let clipboard: any = undefined

export function setClipboard(value: any) {
	clipboard = value
}

export function getClipboard(): any {
	return clipboard
}
