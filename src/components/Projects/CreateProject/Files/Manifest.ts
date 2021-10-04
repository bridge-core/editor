import { FileSystem } from '/@/components/FileSystem/FileSystem'
import { ICreateProjectOptions } from '/@/components/Projects/CreateProject/CreateProject'
import { TPackType } from '/@/components/Projects/CreateProject/Packs/Pack'
import { CreateFile } from './CreateFile'
import { v4 as uuid } from 'uuid'
import { version as appVersion } from '/@/appVersion.json'
import { App } from '/@/App'

export class CreateManifest extends CreateFile {
	public readonly id = 'packManifest'
	public isConfigurable = false

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
		// Set uuids for packs
		if (createOptions.packs.includes('behaviorPack'))
			createOptions.uuids.data ??= uuid()
		if (createOptions.packs.includes('resourcePack'))
			createOptions.uuids.resources ??= uuid()
		if (createOptions.packs.includes('skinPack'))
			createOptions.uuids.skin_pack ??= uuid()
		if (createOptions.packs.includes('worldTemplate'))
			createOptions.uuids.world_template ??= uuid()

		// Base manifest
		const manifest: any = {
			format_version: 2,
			metadata: {
				authors: Array.isArray(createOptions.author)
					? createOptions.author
					: [createOptions.author],
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
				uuid: createOptions.uuids[this.type ?? 'data'] ?? uuid(),
				version: [1, 0, 0],
			},
			modules: [
				{
					type: this.type,
					uuid: uuid(),
					version: [1, 0, 0],
				},
			],
		}

		// Register the resource pack as a dependency of the BP
		if (
			createOptions.rpAsBpDependency &&
			createOptions.packs.includes('resourcePack') &&
			this.type === 'data'
		) {
			if (!createOptions.uuids.resources)
				throw new Error(
					'Trying to register RP uuid before it was defined'
				)

			manifest.dependencies = [
				{ uuid: createOptions.uuids.resources, version: [1, 0, 0] },
			]
		}
		// Register the behavior pack as a dependency of the RP
		if (
			createOptions.bpAsRpDependency &&
			createOptions.packs.includes('behaviorPack') &&
			this.type === 'resources'
		) {
			if (!createOptions.uuids.data)
				throw new Error(
					'Trying to register RP uuid before it was defined'
				)

			manifest.dependencies = [
				{ uuid: createOptions.uuids.data, version: [1, 0, 0] },
			]
		}

		// Behavior pack modules
		if (
			this.type === 'data' &&
			createOptions.experimentalGameplay.additionalModdingCapabilities
		) {
			manifest.modules.push({
				type: 'client_data',
				uuid: uuid(),
				version: [1, 0, 0],
			})
		}
		if (
			this.type === 'data' &&
			createOptions.experimentalGameplay.enableGameTestFramework
		) {
			manifest.modules.push({
				type: 'javascript',
				uuid: uuid(),
				entry: 'scripts/main.js',
				version: [1, 0, 0],
			})
			manifest.dependencies ??= []
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
