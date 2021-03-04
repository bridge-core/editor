import { compare } from 'compare-versions'
import JSZip from 'jszip'
import { SimpleTaskService } from '/@/components/TaskManager/SimpleWorkerTask'
import { FileSystem } from '/@/components/FileSystem/FileSystem'
import { baseUrl } from '/@/utils/baseUrl'
import { version as appVersion } from '/@/appVersion.json'
import { expose } from 'comlink'
import { whenIdle } from '/@/utils/whenIdle'

export class DataLoaderService extends SimpleTaskService {
	protected fileSystem: FileSystem
	constructor(baseDirectory: FileSystemDirectoryHandle) {
		super()
		this.fileSystem = new FileSystem(baseDirectory)
	}

	async setup() {
		if (await this.isUpdateAvailable()) {
			console.log('Downloading new data...')
			await this.load()
			console.log('Data updated!')
		}
	}

	protected async isUpdateAvailable() {
		let remoteVersion: string
		try {
			remoteVersion = await fetch(
				baseUrl + 'data/version.txt'
			).then((response) => response.text())
		} catch (err) {
			return false
		}

		let localVersion: string
		try {
			localVersion = await this.fileSystem
				.readFile('data/packages/version.txt')
				.then((data) => data.text())
		} catch {
			return true
		}
		console.log(
			`App version: ${appVersion}\nLocal data version: ${localVersion}\nRemote data version: ${remoteVersion}`
		)

		// See: https://discord.com/channels/602097536404160523/603989805763788800/812075892158890034
		if (
			remoteVersion[0] === "'" &&
			remoteVersion[remoteVersion.length - 1] === "'"
		)
			remoteVersion = remoteVersion.slice(1, -1)
		if (
			localVersion[0] === "'" &&
			localVersion[localVersion.length - 1] === "'"
		)
			localVersion = localVersion.slice(1, -1)

		return compare(remoteVersion, localVersion, '>')
	}

	protected async load() {
		try {
			await this.fileSystem.unlink('data/packages')
		} catch {}

		const zip = await fetch(baseUrl + 'data/package.zip')
			.then((response) => response.arrayBuffer())
			.then((data) => JSZip.loadAsync(data))

		const files = Object.entries(zip.files)
		this.progress.setTotal(files.length + 1)
		this.progress.addToCurrent(1)

		for (const [fileName, zipEntry] of files) {
			if (fileName.startsWith('.')) continue

			if (zipEntry.dir) {
				await whenIdle(
					async () =>
						await this.fileSystem.mkdir(
							`data/packages/${fileName}`.slice(0, -1),
							{
								recursive: true,
							}
						)
				)

				this.progress.addToCurrent(1)
				continue
			}

			await whenIdle(
				async () =>
					await this.fileSystem.writeFile(
						`data/packages/${fileName}`,
						await zipEntry.async('arraybuffer')
					)
			)

			this.progress.addToCurrent(1)
		}
	}
}

expose(DataLoaderService, self)
