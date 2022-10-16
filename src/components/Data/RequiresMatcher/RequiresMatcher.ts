import { TCompareOperator, compareVersions } from 'bridge-common-utils'
import { TPackTypeId } from '/@/components/Data/PackType'
import { App } from '/@/App'
import { getLatestFormatVersion } from '/@/components/Data/FormatVersions'
import json5 from 'json5'

export interface IRequirements {
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
	dependencies?: string[]
	/**
	 * Whether all conditions must be met. If set to false, any condition met makes the matcher valid.
	 */
	matchAll?: boolean
}

export interface IFailure {
	type:
		| 'targetVersion'
		| 'experimentalGameplay'
		| 'packTypes'
		| 'manifestDependency'
}

export class RequiresMatcher {
	protected experimentalGameplay: Record<string, boolean> = {}
	protected projectTargetVersion: string = ''
	public failures: IFailure[] = []
	// The following properties will only be defined after calling setup()
	protected latestFormatVersion!: string
	protected bpManifest: any
	protected isSetup = false
	protected app!: App

	constructor() {}

	async setup() {
		if (this.isSetup) return

		this.app = await App.getApp()
		const [_, latestFormatVersion, bpManifest] = await Promise.all([
			this.app.projectManager.projectReady.fired,
			getLatestFormatVersion(),
			this.app.fileSystem
				.readJSON(
					this.app.project.config.resolvePackPath(
						'behaviorPack',
						'manifest.json'
					)
				)
				.catch(() => null),
		])

		const config = this.app.project.config.get()

		this.experimentalGameplay = config.experimentalGameplay ?? {}

		this.latestFormatVersion = latestFormatVersion
		this.projectTargetVersion =
			config.targetVersion ?? this.latestFormatVersion

		this.bpManifest = bpManifest
		this.isSetup = true
	}
	protected resetFailures() {
		this.failures = []
	}

	isValid(requires?: IRequirements) {
		this.resetFailures()

		if (!requires) return true
		if (!this.isSetup)
			throw new Error(
				'RequiresMatcher is not setup. Make sure to call setup() before isValid().'
			)
		requires.matchAll ??= true

		// Pack type
		const matchesPackTypes = this.app.project.hasPacks(
			requires.packTypes ?? []
		)
		// Target version
		const matchesTargetVersion =
			!requires.targetVersion ||
			(!Array.isArray(requires.targetVersion)
				? compareVersions(
						this.projectTargetVersion,
						requires.targetVersion?.min ?? '1.8.0',
						'>='
				  ) &&
				  compareVersions(
						this.projectTargetVersion,
						requires.targetVersion?.max ?? '1.18.0',
						'<='
				  )
				: compareVersions(
						this.projectTargetVersion,
						requires.targetVersion[1],
						requires.targetVersion[0]
				  ))
		// Experimental gameplay
		const matchesExperimentalGameplay =
			!requires.experimentalGameplay ||
			requires.experimentalGameplay.some((experimentalFeature) =>
				experimentalFeature.startsWith('!')
					? !this.experimentalGameplay[
							experimentalFeature.replace('!', '')
					  ]
					: this.experimentalGameplay[experimentalFeature]
			)
		// Manifest dependencies
		const dependencies: string[] | undefined =
			this.bpManifest?.dependencies?.map((dep: any) => {
				if (dep?.module_name) {
					// Convert old module names to new naming convention
					switch (dep.module_name) {
						case 'mojang-minecraft':
							return '@minecraft/server'
						case 'mojang-gametest':
							return '@minecraft/server-gametest'
						case 'mojang-minecraft-server-ui':
							return '@minecraft/server-ui'
						case 'mojang-minecraft-server-admin':
							return '@minecraft/server-admin'
						case 'mojang-net':
							return '@minecraft/server-net'
						default:
							return dep.module_name
					}
				} else {
					switch (dep.uuid ?? '') {
						case 'b26a4d4c-afdf-4690-88f8-931846312678':
							return '@minecraft/server'
						case '6f4b6893-1bb6-42fd-b458-7fa3d0c89616':
							return '@minecraft/server-gametest'
						case '2bd50a27-ab5f-4f40-a596-3641627c635e':
							return '@minecraft/server-ui'
						case '53d7f2bf-bf9c-49c4-ad1f-7c803d947920':
							return '@minecraft/server-admin'
						case '777b1798-13a6-401c-9cba-0cf17e31a81b':
							return '@minecraft/server-net'
						default:
							return ''
					}
				}
			})

		const matchesManifestDependency =
			!requires.dependencies ||
			!dependencies ||
			requires?.dependencies.every((dep) => dependencies.includes(dep))

		if (!matchesPackTypes) this.failures.push({ type: 'packTypes' })
		if (!matchesTargetVersion) this.failures.push({ type: 'targetVersion' })
		if (!matchesExperimentalGameplay)
			this.failures.push({ type: 'experimentalGameplay' })
		if (!matchesManifestDependency)
			this.failures.push({ type: 'manifestDependency' })

		return requires.matchAll
			? matchesPackTypes &&
					matchesExperimentalGameplay &&
					matchesTargetVersion &&
					matchesManifestDependency
			: (matchesPackTypes && requires.packTypes) ||
					(matchesExperimentalGameplay &&
						requires.experimentalGameplay) ||
					(matchesTargetVersion && requires.targetVersion) ||
					(matchesManifestDependency && requires.dependencies)
	}
}
