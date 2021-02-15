import { App } from '@/App'
import { Signal } from '@/components/Common/Event/Signal'
import { compare } from 'compare-versions'
import JSZip from 'jszip'
import { dirname } from 'path'
import { FileSystem } from '../FileSystem/FileSystem'

export class DataLoader extends Signal<void> {
	async setup(app: App) {
		app.windows.loadingWindow.open('Downloading new data...')
		await app.fileSystem.fired

		if (await this.isUpdateAvailable(app.fileSystem)) {
			console.log('Downloading new data...')
			await this.load(app.fileSystem)
			console.log('Data updated!')
		}

		this.dispatch()
		app.windows.loadingWindow.close()
	}

	protected async isUpdateAvailable(fileSystem: FileSystem) {
		let remoteVersion: string
		try {
			remoteVersion = await fetch(
				(process.env.NODE_ENV === 'production' ? '/editor/' : '') +
					'data/version.txt'
			).then(response => response.text())
		} catch (err) {
			return false
		}

		let localVersion: string
		try {
			localVersion = await fileSystem
				.readFile('data/packages/version.txt')
				.then(data => data.text())
		} catch {
			return true
		}

		return compare(remoteVersion, localVersion, '>')
	}

	protected async load(fileSystem: FileSystem) {
		try {
			await fileSystem.unlink('data/packages')
		} catch {}

		const zip = await fetch(
			(process.env.NODE_ENV === 'production' ? '/editor/' : '') +
				'data/package.zip'
		)
			.then(response => response.arrayBuffer())
			.then(data => JSZip.loadAsync(data))

		const promises: Promise<void>[] = []

		zip.forEach((relativePath, zipEntry) => {
			promises.push(
				new Promise<void>(async resolve => {
					if (zipEntry.dir) return resolve()

					await fileSystem.mkdir(
						dirname(`data/packages/${relativePath}`),
						{ recursive: true }
					)

					await fileSystem.writeFile(
						`data/packages/${relativePath}`,
						await zipEntry.async('blob')
					)

					resolve()
				})
			)
		})

		await Promise.all(promises)
	}
}
