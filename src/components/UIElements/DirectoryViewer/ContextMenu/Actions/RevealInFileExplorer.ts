import { VirtualDirectoryHandle } from '/@/components/FileSystem/Virtual/DirectoryHandle'
import { VirtualFileHandle } from '/@/components/FileSystem/Virtual/FileHandle'
import { TauriFsStore } from '/@/components/FileSystem/Virtual/Stores/TauriFs'
import { BaseWrapper } from '/@/components/UIElements/DirectoryViewer/Common/BaseWrapper'
import { revealInFileExplorer } from '/@/utils/revealInFileExplorer'

export const RevealInFileExplorer = (
	baseWrapper: BaseWrapper<VirtualDirectoryHandle | VirtualFileHandle>
) => {
	if (!import.meta.env.VITE_IS_TAURI_APP) return null

	return {
		icon:
			baseWrapper.kind === 'directory'
				? 'mdi-folder-marker-outline'
				: 'mdi-file-marker-outline',
		name: 'actions.revealInFileExplorer.name',
		onTrigger: async () => {
			let path = baseWrapper.path
			const baseStore = baseWrapper.handle.getBaseStore()
			if (!(baseStore instanceof TauriFsStore) || !path) return

			revealInFileExplorer(await baseStore.resolvePath(path))
		},
	}
}
