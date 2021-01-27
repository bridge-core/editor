import { App } from '@/App'
import { Signal } from '@/appCycle/EventSystem'
import { compare } from 'compare-versions'
import JSZip from 'jszip'
import { dirname } from 'path'
import { FileSystem } from '../FileSystem/Main'

export class DataLoader extends Signal<void> {
	get ready() {
		return new Promise<void>(resolve => this.once(resolve))
	}
	async setup(app: App) {
		app.windows.loadingWindow.open()
		await app.fileSystem.ready

		if (await this.isUpdateAvailable(app.fileSystem)) {
			console.log('Downloading new data...')
			await this.load(app.fileSystem)
			console.log('Data updated!')
		}
		console.log('DONE')
		this.dispatch()
		app.windows.loadingWindow.close()
	}

	protected async isUpdateAvailable(fileSystem: FileSystem) {
		let remoteVersion: string
		try {
			remoteVersion = await fetch(
				process.env.NODE_ENV === 'production'
					? '/editor/'
					: '' + 'data/version.txt'
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
			process.env.NODE_ENV === 'production'
				? '/editor/'
				: '' + 'data/package.zip'
		)
			.then(response => response.arrayBuffer())
			.then(data => JSZip.loadAsync(data))

		const promises: Promise<void>[] = []

		zip.forEach((relativePath, zipEntry) => {
			promises.push(
				new Promise<void>(async resolve => {
					await fileSystem.mkdir(
						dirname(`data/packages/${relativePath}`),
						{ recursive: true }
					)

					if (!zipEntry.dir)
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
