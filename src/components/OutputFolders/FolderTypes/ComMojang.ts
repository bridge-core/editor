import { OutputFolder } from './OutputFolder'

export interface IComMojangDataBag {
	type: 'comMojang'
	minecraftVersion?: string
}

export class ComMojangFolder extends OutputFolder<IComMojangDataBag> {
	async requestPermission(): Promise<void> {
		await super.requestPermission()

		this.dataBag.minecraftVersion = await this.getMinecraftVersion()
		this.dataBag.type = 'comMojang'
	}

	/**
	 * Try to load the Minecraft version the com.mojang folder belongs to
	 * @returns
	 */
	async getMinecraftVersion() {
		const {
			lastsession_Build: minecraftVersion,
		} = await this.fileSystem
			.readJSON(`minecraftpe/telemetry_info.json`)
			.catch(() => ({}))

		return <string>minecraftVersion
	}
}
