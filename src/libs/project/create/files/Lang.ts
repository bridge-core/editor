import { BaseFileSystem } from '@/libs/fileSystem/BaseFileSystem'
import { join } from 'pathe'
import { CreateProjectConfig } from '../../CreateProjectConfig'

export async function createLang(fileSystem: BaseFileSystem, path: string, config: CreateProjectConfig, packType: string) {
	await fileSystem.makeDirectory(join(path, 'texts'))

	if (packType === 'skinPack') {
		await fileSystem.writeFile(join(path, 'texts/en_US.lang'), `skinpack.${config.namespace}=${config.name}`)
	} else {
		await fileSystem.writeFile(join(path, 'texts/en_US.lang'), `pack.name=${config.name}\npack.description=${config.description}`)
	}

	await fileSystem.writeFileJson(join(path, 'texts/languages.json'), ['en_US'], true)
}
