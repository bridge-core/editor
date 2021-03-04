import { compare } from 'compare-versions'
import JSZip from 'jszip'
import { SimpleTaskService } from '/@/components/TaskManager/SimpleWorkerTask'
import { FileSystem } from '/@/components/FileSystem/FileSystem'
import { baseUrl } from '/@/utils/baseUrl'
import { dirname } from '/@/utils/path'
import { expose } from 'comlink'

export class DataLoaderService extends SimpleTaskService {
	protected fileSystem: FileSystem
	constructor(baseDirectory: FileSystemDirectoryHandle) {
		super()
		this.fileSystem = new FileSystem(baseDirectory)
	}

	async setup() {
		console.log('Comparing versions...')
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

		console.log(zip.length)
		this.progress.setTotal(zip.length * 2)
		this.progress.addToCurrent(1)

		const promises: Promise<void>[] = []

		zip.forEach((relativePath, zipEntry) => {
			promises.push(
				new Promise<void>(async (resolve) => {
					if (zipEntry.dir) {
						this.progress.addToCurrent(1)
						return resolve()
					}

					await this.fileSystem.mkdir(
						dirname(`data/packages/${relativePath}`),
						{ recursive: true }
					)
					this.progress.addToCurrent(1)

					await this.fileSystem.writeFile(
						`data/packages/${relativePath}`,
						await zipEntry.async('blob')
					)

					this.progress.addToCurrent(1)
					resolve()
				})
			)
		})

		await Promise.all(promises)
	}
}

expose(DataLoaderService, self)
