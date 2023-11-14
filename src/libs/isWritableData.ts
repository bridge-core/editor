/**
 * A function that returns whether the given data is writable using the FileSystem Access API
 */
export function isWritableData(data: any): boolean {
	return (
		typeof data === 'string' ||
		data instanceof Blob ||
		data instanceof File ||
		data instanceof ArrayBuffer ||
		data?.buffer instanceof ArrayBuffer
	)
}
