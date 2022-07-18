import { BaseWrapper } from '../../Common/BaseWrapper'
import { download } from '/@/components/FileSystem/saveOrDownload'
import { ZipDirectory } from '/@/components/FileSystem/Zip/ZipDirectory'

export const DownloadAction = (baseWrapper: BaseWrapper<any>) => ({
	icon:
		baseWrapper.kind === 'directory'
			? 'mdi-folder-download-outline'
			: 'mdi-file-download-outline',
	name: 'actions.download.name',
	onTrigger: async () => {
		if (baseWrapper.kind === 'file') {
			const file: File = await baseWrapper.handle.getFile()

			download(baseWrapper.name, new Uint8Array(await file.arrayBuffer()))
		} else {
			const zip = new ZipDirectory(baseWrapper.handle)
			download(`${baseWrapper.name}.zip`, await zip.package())
		}
	},
})
