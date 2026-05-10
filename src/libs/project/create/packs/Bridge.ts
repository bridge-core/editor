import { join } from 'pathe'
import { BaseFileSystem } from '@/libs/fileSystem/BaseFileSystem'
import { Pack } from './Pack'
import { CreateProjectConfig } from '../../CreateProjectConfig'
import { createConfig } from '../files/Config'
import { createDenoConfig } from '../files/DenoConfig'
import { createGitIgnore } from '../files/GitIgnore'

export class BridgePack extends Pack {
	public async create(
		fileSystem: BaseFileSystem,
		projectPath: string,
		config: CreateProjectConfig,
		packPath: string
	) {
		await fileSystem.makeDirectory(packPath)

		await fileSystem.makeDirectory(join(packPath, 'compiler'))

		await fileSystem.makeDirectory(join(packPath, 'extensions'))

		await createConfig(fileSystem, join(projectPath, 'config.json'), config)

		await createDenoConfig(fileSystem, join(projectPath, 'deno.json'))

		await createGitIgnore(fileSystem, join(projectPath, '.gitignore'))
	}
}
