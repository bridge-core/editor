import { compare } from 'compare-versions'
import { SimpleTaskService } from '/@/components/TaskManager/SimpleWorkerTask'
import { FileSystem } from '/@/components/FileSystem/FileSystem'
import { baseUrl } from '/@/utils/baseUrl'
import { version as appVersion } from '/@/appVersion.json'
import { expose } from 'comlink'
import { unzipSync } from 'fflate'
import { whenIdle } from '/@/utils/whenIdle'
import { basename, dirname } from '/@/utils/path'

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

		// Avoid "not a semantic version" error
		if (localVersion === '') return true

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
			.then((data) => unzipSync(new Uint8Array(data)))

		this.progress.setTotal(Object.keys(zip).length + 1)
		this.progress.addToCurrent(1)

		const handles: Record<string, FileSystemDirectoryHandle> = {
			'.': await this.fileSystem.getDirectoryHandle('data/packages', {
				create: true,
			}),
		}

		for (const filePath in zip) {
			const name = basename(filePath)
			if (name.startsWith('.')) continue

			const parentDir = dirname(filePath)

			if (filePath.endsWith('/')) {
				await whenIdle(async () => {
					handles[filePath.slice(0, -1)] = await handles[
						parentDir
					].getDirectoryHandle(name, {
						create: true,
					})
				})

				this.progress.addToCurrent(1)
				continue
			}

			await whenIdle(async () => {
				await this.fileSystem.write(
					await handles[parentDir].getFileHandle(name, {
						create: true,
					}),
					zip[filePath]
				)
			})

			this.progress.addToCurrent(1)
		}
	}
}

expose(DataLoaderService, self)
