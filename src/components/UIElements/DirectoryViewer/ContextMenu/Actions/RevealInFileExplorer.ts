import { invoke } from '@tauri-apps/api'
import { BaseWrapper } from '/@/components/UIElements/DirectoryViewer/Common/BaseWrapper'
import { join } from '/@/utils/path'
import { appLocalDataDir } from '@tauri-apps/api/path'

export const RevealInFileExplorer = (baseWrapper: BaseWrapper<any>) =>
	import.meta.env.VITE_IS_TAURI_APP
		? {
				icon:
					baseWrapper.kind === 'directory'
						? 'mdi-folder-marker-outline'
						: 'mdi-file-marker-outline',
				name: 'actions.revealInFileExplorer.name',
				onTrigger: async () => {
					let path = baseWrapper.path
					if (!path) return

					path = join(
						await appLocalDataDir(),
						'bridge',
						path.replace('~local/', '')
					)

					invoke('reveal_in_file_explorer', {
						path,
					})
				},
		  }
		: null
