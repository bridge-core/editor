import { FileSystem } from '/@/components/FileSystem/FileSystem'
import { ICreateProjectOptions } from '/@/components/Projects/CreateProject/CreateProject'
import { TPackType } from '/@/components/Projects/CreateProject/Packs/Pack'
import { CreateFile } from './CreateFile'
import { v4 as uuid } from 'uuid'

const replaceTargetVersion: Record<string, string | undefined> = {
	'1.17.10': '1.17.0',
	'1.17.20': '1.17.0',
}

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
			case 'WT':
				return 'world_template'
		}
	}

	protected transformTargetVersion(targetVersion: string) {
		return replaceTargetVersion[targetVersion] ?? targetVersion
	}

	create(fs: FileSystem, createOptions: ICreateProjectOptions) {
		// Base manifest
		const manifest: any = {
			format_version: 2,
			header: {
				name: createOptions.useLangForManifest
					? createOptions.name
					: 'pack.name',
				description: createOptions.useLangForManifest
					? createOptions.description
					: 'pack.description',
				min_engine_version:
					this.type === 'data' || 'resources'
						? this.transformTargetVersion(
								createOptions.targetVersion
						  )
								.split('.')
								.map((str) => Number(str))
						: undefined,
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
		}

		// Register the resource pack as a dependency of the BP
		if (
			createOptions.rpAsBpDependency &&
			createOptions.packs.includes('RP')
		) {
			if (this.type === 'resources') {
				createOptions.rpUuid = manifest.header.uuid
			} else if (this.type === 'data') {
				if (!createOptions.rpUuid)
					throw new Error(
						`Trying to register RP uuid before it was defined`
					)

				manifest.dependencies = [
					{ uuid: createOptions.rpUuid, version: [1, 0, 0] },
				]
			}
		}

		// Behavior pack modules
		if (this.type === 'data' && createOptions.scripting) {
			manifest.modules.push({
				type: 'client_data',
				uuid: uuid(),
				version: [1, 0, 0],
			})
		}
		if (this.type === 'data' && createOptions.gameTest) {
			manifest.modules.push({
				type: 'javascript',
				uuid: uuid(),
				entry: 'scripts/gametests/Main.js',
				version: [1, 0, 0],
			})
			if (!manifest.dependencies) {
				manifest.dependencies = []
			}
			manifest.dependencies.push(
				{
					// Minecraft native module
					uuid: 'b26a4d4c-afdf-4690-88f8-931846312678',
					version: [0, 1, 0],
				},
				{
					// GameTest native module
					uuid: '6f4b6893-1bb6-42fd-b458-7fa3d0c89616',
					version: [0, 1, 0],
				}
			)
		}

		return fs.writeJSON(`${this.pack}/manifest.json`, manifest, true)
	}
}
