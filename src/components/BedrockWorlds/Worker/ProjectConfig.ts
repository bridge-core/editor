import { ProjectConfig } from 'mc-project-core'
import { FileSystem } from '../../FileSystem/FileSystem'
import { dirname } from '/@/utils/path'

/**
 * A project config implementation specific to the world worker (WW)
 */
export class WWProjectConfig extends ProjectConfig {
	constructor(
		protected fileSystem: FileSystem,
		protected configPath: string
	) {
		super(dirname(configPath))
	}

	readConfig() {
		return this.fileSystem.readJSON(this.configPath)
	}
	async writeConfig(configJson: any) {
		await this.fileSystem.writeJSON(this.configPath, configJson)
	}
}
