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
	 * Check for manifest dependency uuids to be present in the pack.
	 */
	dependencies: string[]
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

	constructor(protected requires?: IRequirements) {}

	async isValid() {
		if (!this.requires) return true

		const app = await App.getApp()
		await app.projectManager.projectReady.fired
		const config = app.project.config.get()

		this.experimentalGameplay = config.experimentalGameplay ?? {}
		this.projectTargetVersion =
			config.targetVersion ?? (await getLatestFormatVersion())

		// Pack type
		const matchesPackTypes = app.project.hasPacks(
			this.requires.packTypes ?? []
		)
		// Target version
		const matchesTargetVersion =
			!this.requires.targetVersion ||
			(!Array.isArray(this.requires.targetVersion)
				? compareVersions(
						this.projectTargetVersion,
						this.requires.targetVersion?.min ?? '1.8.0',
						'>='
				  ) &&
				  compareVersions(
						this.projectTargetVersion,
						this.requires.targetVersion?.max ?? '1.18.0',
						'<='
				  )
				: compareVersions(
						this.projectTargetVersion,
						this.requires.targetVersion[1],
						this.requires.targetVersion[0]
				  ))
		// Experimental gameplay
		const matchesExperimentalGameplay =
			!this.requires.experimentalGameplay ||
			this.requires.experimentalGameplay.some((experimentalFeature) =>
				experimentalFeature.startsWith('!')
					? !this.experimentalGameplay[
							experimentalFeature.replace('!', '')
					  ]
					: this.experimentalGameplay[experimentalFeature]
			)
		// Manifest dependencies
		let manifest
		try {
			const file = await app.fileSystem.readFile(
				app.project.config.resolvePackPath(
					'behaviorPack',
					'manifest.json'
				)
			)
			manifest = json5.parse(await file.text())
		} catch {}
		const dependencies: string[] | undefined = manifest?.dependencies?.map(
			(dep: any) => dep.uuid ?? ''
		)
		const matchesManifestDependency =
			!this.requires.dependencies ||
			!dependencies ||
			this.requires?.dependencies.every((dep) =>
				dependencies.includes(dep)
			)

		if (!matchesPackTypes) this.failures.push({ type: 'packTypes' })
		if (!matchesTargetVersion) this.failures.push({ type: 'targetVersion' })
		if (!matchesExperimentalGameplay)
			this.failures.push({ type: 'experimentalGameplay' })
		if (!matchesManifestDependency)
			this.failures.push({ type: 'manifestDependency' })

		return (
			matchesPackTypes &&
			matchesExperimentalGameplay &&
			matchesTargetVersion &&
			matchesManifestDependency
		)
	}
}
