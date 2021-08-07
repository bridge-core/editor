import { FileSystem } from '/@/components/FileSystem/FileSystem'
import { ICreateProjectOptions } from '/@/components/Projects/CreateProject/CreateProject'
import { TPackType } from '/@/components/Projects/CreateProject/Packs/Pack'
import { CreateFile } from './CreateFile'
import { v4 as uuid } from 'uuid'
import { version as appVersion } from '/@/appVersion.json'
import { App } from '/@/App'

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

	protected async transformTargetVersion(
		fs: FileSystem,
		targetVersion: string
	) {
		const app = await App.getApp()
		const replaceTargetVersion: Record<
			string,
			string
		> = await app.dataLoader.readJSON(
			'data/packages/minecraftBedrock/minEngineVersionMap.json'
		)

		return replaceTargetVersion[targetVersion] ?? targetVersion
	}

	async create(fs: FileSystem, createOptions: ICreateProjectOptions) {
		// Base manifest
		const manifest: any = {
			format_version: 2,
			metadata: {
				authors: [createOptions.author],
				generated_with: {
					bridge: [appVersion],
				},
			},
			header: {
				name: createOptions.useLangForManifest
					? createOptions.name
					: 'pack.name',
				description: createOptions.useLangForManifest
					? createOptions.description
					: 'pack.description',
				min_engine_version:
					this.type === 'data' || 'resources'
						? (
								await this.transformTargetVersion(
									fs,
									createOptions.targetVersion
								)
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

		if (this.type === 'world_template') {
			manifest.header.lock_template_options = true
			manifest.header.base_game_version = createOptions.targetVersion.split(
				'.'
			)
		}

		await fs.writeJSON(`${this.pack}/manifest.json`, manifest, true)
	}
}
