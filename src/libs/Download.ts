export async function download(name: string, data: Uint8Array) {
	const url = URL.createObjectURL(new Blob([data], { type: 'application/file-export' }))
	const element = document.createElement('a')
	element.download = name
	element.href = url

	element.click()

	URL.revokeObjectURL(url)
}
