import { App } from '/@/App'
import { Unzipper } from '../FileSystem/Unzipper'
import { baseUrl } from '/@/utils/baseUrl'
import { Signal } from '/@/components/Common/Event/Signal'
import { version as appVersion } from '/@/appVersion.json'
import { compare } from 'compare-versions'
import { StreamingUnzipper } from '../FileSystem/StreamingUnzipper/StreamingUnzipper'

export class DataLoader extends Signal<void> {
	constructor(protected app: App) {
		super()
	}

	async start() {
		this.app.windows.loadingWindow.open(
			'windows.loadingWindow.titles.downloadingData'
		)
		await this.app.fileSystem.fired

		if (await this.isUpdateAvailable()) {
			await this.downloadData()
		}

		this.dispatch()
		this.app.windows.loadingWindow.close()
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
			localVersion = await this.app.fileSystem
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

	protected async downloadData() {
		console.log('Downloading new data...')

		try {
			await this.app.fileSystem.unlink('data/packages')
		} catch {}

		const unzipper = new StreamingUnzipper(
			await this.app.fileSystem.getDirectoryHandle('data/packages', {
				create: true,
			})
		)

		unzipper.createTask(this.app.taskManager, {
			icon: 'mdi-download',
			description: 'taskManager.tasks.dataLoader.description',
			name: 'taskManager.tasks.dataLoader.title',
		})

		await fetch(baseUrl + 'data/package.zip').then((response) =>
			response.body ? unzipper.unzip(response.body) : null
		)

		console.log('Data updated!')
	}
}
