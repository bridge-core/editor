import { FileSystem } from '@/components/FileSystem/FileSystem'
import { ICreateProjectOptions } from '@/components/Project/CreateProject/CreateProject'
import { TPackType } from '@/components/Project/CreateProject/Packs/Pack'
import { CreateFile } from '@/components/Project/CreateProject/Files/File'
import { v4 as uuid } from 'uuid'

export class CreateManifest extends CreateFile {
	constructor(protected pack: TPackType) {
		super()
	}

	get type() {
		switch (this.pack) {
			case 'BP':
				return 'data'
			case 'RP':
				return 'resources'
			case 'SP':
				return 'skin_pack'
		}
	}

	create(fs: FileSystem, createOptions: ICreateProjectOptions) {
		return fs.writeJSON(
			`${this.pack}/manifest.json`,
			{
				format_version: 2,
				header: {
					name: 'pack.name',
					description: 'pack.description',
					min_engine_version: createOptions.targetVersion.split('.'),
					uuid: uuid(),
					version: [1, 0, 0],
				},
				modules: [
					{
						description: createOptions.description,
						type: this.type,
						uuid: uuid(),
						version: [1, 0, 0],
					},
				],
			},
			true
		)
	}
}
