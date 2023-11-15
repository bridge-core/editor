import { v4 as uuid } from 'uuid'
import { BaseFileSystem } from '/@/libs/fileSystem/BaseFileSystem'

export function createManifest(fileSystem: BaseFileSystem, path: string) {
	const manifest = {
		format_version: 2,
		metadata: {
			authors: ['bridge.'],
			generated_with: {
				bridge: ['2.8.0'],
				dash: ['0.10.11'],
			},
		},
		header: {
			name: 'test',
			description: 'test description',
			min_engine_version: 'idk',
			uuid: uuid(),
			version: [1, 0, 0],
		},
		modules: [
			{
				type: 'idk',
				uuid: uuid(),
				version: [1, 0, 0],
			},
		],
	}

	fileSystem.writeFile(path, JSON.stringify(manifest, null, 2))
}
