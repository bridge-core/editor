import { BaseWrapper } from '../../Common/BaseWrapper'
import { download } from '/@/components/FileSystem/saveOrDownload'

export const DownloadAction = (baseWrapper: BaseWrapper<any>) => ({
	icon:
		baseWrapper.kind === 'directory'
			? 'mdi-folder-download-outline'
			: 'mdi-file-download-outline',
	name: 'actions.download.name',
	description: 'actions.download.description',
	onTrigger: async () => {
		if (baseWrapper.kind === 'file') {
			const file: File = await baseWrapper.handle.getFile()

			download(file.name, new Uint8Array(await file.arrayBuffer()))
		} else {
			// TODO: Implement directory download (download as zip)
			throw new Error(`Downloading directories is not implemented yet`)
		}
	},
})
