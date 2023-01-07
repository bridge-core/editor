import { DirectoryWrapper } from '../../DirectoryView/DirectoryWrapper'
import { FileWrapper } from '../../FileView/FileWrapper'
import { VirtualDirectoryHandle } from '/@/components/FileSystem/Virtual/DirectoryHandle'
import { VirtualFileHandle } from '/@/components/FileSystem/Virtual/FileHandle'
import { BaseVirtualHandle } from '/@/components/FileSystem/Virtual/Handle'
import { TauriFsStore } from '/@/components/FileSystem/Virtual/Stores/TauriFs'
import { BaseWrapper } from '/@/components/UIElements/DirectoryViewer/Common/BaseWrapper'
import { revealInFileExplorer } from '/@/utils/revealInFileExplorer'

export const RevealInFileExplorer = (
	baseWrapper: FileWrapper | DirectoryWrapper
) => {
	if (!import.meta.env.VITE_IS_TAURI_APP) return null

	return {
		icon:
			baseWrapper.kind === 'directory'
				? 'mdi-folder-marker-outline'
				: 'mdi-file-marker-outline',
		name: 'actions.revealInFileExplorer.name',
		onTrigger: async () => {
			const handle = baseWrapper.handle
			if (!(handle instanceof BaseVirtualHandle)) return

			let path = baseWrapper.path
			const baseStore = handle.getBaseStore()
			if (!(baseStore instanceof TauriFsStore) || !path) return

			revealInFileExplorer(await baseStore.resolvePath(path))
		},
	}
}
