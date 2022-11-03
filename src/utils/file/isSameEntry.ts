import {
	BaseVirtualHandle,
	VirtualHandle,
} from '/@/components/FileSystem/Virtual/Handle'

export function isSameEntry(
	entry1: FileSystemHandle | VirtualHandle,
	entry2: FileSystemHandle | VirtualHandle
) {
	if (
		entry1 instanceof BaseVirtualHandle &&
		entry2 instanceof BaseVirtualHandle
	) {
		return entry1.isSameEntry(entry2)
	} else if (
		entry1 instanceof BaseVirtualHandle ||
		entry2 instanceof BaseVirtualHandle
	) {
		return false
	}

	return entry1.isSameEntry(entry2)
}
