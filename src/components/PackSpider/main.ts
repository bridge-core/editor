/**
 * PackSpider is a utility tool for crawling BPs & RPs and creating logical connections between files
 */

export class PackSpider {
	protected bp: FileSystemDirectoryHandle | undefined
	protected rp: FileSystemDirectoryHandle | undefined

	async setup(baseDir: FileSystemDirectoryHandle) {
		this.bp = await baseDir.getDirectoryHandle('BP')
		this.rp = await baseDir.getDirectoryHandle('RP')
	}
}
