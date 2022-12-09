import { VirtualDirectoryHandle } from './DirectoryHandle'
import { BaseStore } from './Stores/BaseStore'

export function getParent(baseStore: BaseStore, basePath: string[]) {
	return new VirtualDirectoryHandle(
		baseStore,
		// Base path always contains itself so new directory handle name is at index - 2
		basePath.length > 1 ? basePath[basePath.length - 2] : '',
		basePath.slice(0, -1)
	)
}
