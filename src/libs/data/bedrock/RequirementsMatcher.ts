import { fileSystem } from '@/libs/fileSystem/FileSystem'
import { BedrockProject } from '@/libs/project/BedrockProject'
import { TCompareOperator, compareVersions } from 'bridge-common-utils'
import { TPackTypeId } from 'mc-project-core'
import { Data } from '@/libs/data/Data'
import { AsyncDisposable } from '@/libs/disposeable/Disposeable'

export interface Requirements {
	/**
	 * Compare a version with the project's target version.
	 */
	targetVersion?: [TCompareOperator, string] | { min: string; max: string }
	/**
	 * Check for the status of experimental gameplay toggles in the project.
	 */
	experimentalGameplay?: string[]
	/**
	 * Check whether pack types are present in the project.
	 */
	packTypes?: TPackTypeId[]
	/**
	 * Check for manifest dependencies to be present in the pack.
	 */
	dependencies?: { module_name: string; version?: string }[]
	/**
	 * Whether all conditions must be met. If set to false, any condition met makes the matcher valid.
	 */
	matchAll?: boolean
}

export class RequirementsMatcher implements AsyncDisposable {
	private latestFormatVersion: string = ''
	private behaviourManifest: any | null = null

	constructor(public project: BedrockProject) {}

	public async setup() {
		this.latestFormatVersion = (await Data.get('packages/minecraftBedrock/formatVersions.json'))[0]

		const behaviorPackPath = this.project.resolvePackPath('behaviorPack', 'manifest.json')
		if (this.project.packs['behaviorPack'] && (await fileSystem.exists(behaviorPackPath))) {
			try {
				this.behaviourManifest = await fileSystem.readFileJson(behaviorPackPath)
			} catch {}
		}
	}

	public async dispose() {}

	public matches(requirements: Requirements): boolean {
		for (const pack of requirements.packTypes ?? []) {
			if (this.project.packs[pack] === undefined) return false
		}

		if (requirements.targetVersion !== undefined) {
			const formatVersion = this.project.config?.targetVersion ?? this.latestFormatVersion

			if (Array.isArray(requirements.targetVersion)) {
				if (!compareVersions(formatVersion, requirements.targetVersion[1], requirements.targetVersion[0]))
					return false
			} else {
				if (
					!(
						compareVersions(formatVersion, requirements.targetVersion?.min ?? '1.8.0', '>=') &&
						compareVersions(formatVersion, requirements.targetVersion?.max ?? '1.18.0', '<=')
					)
				)
					return false
			}
		}

		for (const experiment of requirements.experimentalGameplay ?? []) {
			if (experiment.startsWith('!')) {
				if ((this.project.config?.experimentalGameplay ?? {})[experiment.substring(1)]) return false
			} else {
				if (!(this.project.config?.experimentalGameplay ?? {})[experiment]) return false
			}
		}

		const dependencies = this.getDependencies()

		console.log(dependencies)

		for (const dependency of requirements.dependencies ?? []) {
			if (
				!dependencies.find(
					(behaviorDependency) =>
						behaviorDependency.moduleName === dependency.module_name &&
						(dependency.version === undefined || behaviorDependency.version === dependency.version)
				)
			)
				return false
		}

		return true
	}

	private getDependencies(): { moduleName: string; version: string }[] {
		if (this.behaviourManifest === null) return []

		if (this.behaviourManifest.dependencies === undefined) return []

		return this.behaviourManifest.dependencies.map((dependency: any) => {
			if (dependency.module_name) {
				// Convert old module names to new naming convention
				switch (dependency.module_name) {
					case 'mojang-minecraft':
						return {
							moduleName: '@minecraft/server',
							version: dependency.version,
						}
					case 'mojang-gametest':
						return {
							moduleName: '@minecraft/server-gametest',
							version: dependency.version,
						}
					case 'mojang-minecraft-server-ui':
						return {
							moduleName: '@minecraft/server-ui',
							version: dependency.version,
						}
					case 'mojang-minecraft-server-admin':
						return {
							moduleName: '@minecraft/server-admin',
							version: dependency.version,
						}
					case 'mojang-net':
						return {
							moduleName: '@minecraft/server-net',
							version: dependency.version,
						}
					default:
						return {
							moduleName: dependency.module_name,
							version: dependency.version,
						}
				}
			} else {
				switch (dependency.uuid ?? '') {
					case 'b26a4d4c-afdf-4690-88f8-931846312678':
						return {
							moduleName: '@minecraft/server',
							version: dependency.version,
						}
					case '6f4b6893-1bb6-42fd-b458-7fa3d0c89616':
						return {
							moduleName: '@minecraft/server-gametest',
							version: dependency.version,
						}
					case '2bd50a27-ab5f-4f40-a596-3641627c635e':
						return {
							moduleName: '@minecraft/server-ui',
							version: dependency.version,
						}
					case '53d7f2bf-bf9c-49c4-ad1f-7c803d947920':
						return {
							moduleName: '@minecraft/server-admin',
							version: dependency.version,
						}
					case '777b1798-13a6-401c-9cba-0cf17e31a81b':
						return {
							moduleName: '@minecraft/server-net',
							version: dependency.version,
						}
					default:
						return {
							moduleName: dependency.uuid ?? '',
							version: dependency.version,
						}
				}
			}
		})
	}
}
