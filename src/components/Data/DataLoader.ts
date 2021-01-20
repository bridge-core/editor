import { compare } from 'compare-versions'
import JSZip from 'jszip'
import { dirname } from 'path'
import { FileSystem } from '../FileSystem/Main'

export class DataLoader {
	static async setup(fileSystem: FileSystem) {
		if (await this.isUpdateAvailable(fileSystem)) {
			console.log('Downloading new data...')
			await this.load(fileSystem)
			console.log('Data updated!')
		}
	}

	static async isUpdateAvailable(fileSystem: FileSystem) {
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

	protected static async load(fileSystem: FileSystem) {
		await fileSystem.unlink('data/packages')

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
