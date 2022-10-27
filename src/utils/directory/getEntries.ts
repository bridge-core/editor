import { AnyDirectoryHandle } from '/@/components/FileSystem/Types'

export async function getEntries(directoryHandle: AnyDirectoryHandle) {
	const entries = []

	for await (const entry of directoryHandle.values()) {
		entries.push(entry)
	}

	return entries
}
