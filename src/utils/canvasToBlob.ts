export function toBlob(canvas: HTMLCanvasElement) {
	return new Promise<Blob>((resolve, reject) => {
		canvas.toBlob((blob) => {
			if (blob) {
				resolve(blob)
			} else {
				reject(new Error('Canvas is empty'))
			}
		}, 'image/png')
	})
}
