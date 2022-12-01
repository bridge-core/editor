import { appLocalDataDir } from '@tauri-apps/api/path'
import { BaseWrapper } from '/@/components/UIElements/DirectoryViewer/Common/BaseWrapper'
import { join } from '/@/utils/path'
import { revealInFileExplorer } from '/@/utils/revealInFileExplorer'

export const RevealInFileExplorer = (baseWrapper: BaseWrapper<any>) => {
	if (!import.meta.env.VITE_IS_TAURI_APP) return null

	return {
		icon:
			baseWrapper.kind === 'directory'
				? 'mdi-folder-marker-outline'
				: 'mdi-file-marker-outline',
		name: 'actions.revealInFileExplorer.name',
		onTrigger: async () => {
			let path = baseWrapper.path
			if (!path) return

			revealInFileExplorer(join(await appLocalDataDir(), 'bridge', path))
		},
	}
}
