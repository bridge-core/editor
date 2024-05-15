import { v4 as uuid } from 'uuid'
import { BaseFileSystem } from '@/libs/fileSystem/BaseFileSystem'
import { join } from 'pathe'
import { CreateProjectConfig } from '../../CreateProjectConfig'

export async function createLang(fileSystem: BaseFileSystem, path: string, config: CreateProjectConfig) {
	await fileSystem.makeDirectory(join(path, 'texts'))

	await fileSystem.writeFile(join(path, 'texts/en_US.lang'), `skinpack.${config.namespace}=${config.name}`)

	await fileSystem.writeFileJson(join(path, 'texts/languages.json'), ['en_US'], true)
}
