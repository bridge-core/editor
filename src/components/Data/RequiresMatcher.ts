import { TCompareOperator, compareVersions } from 'bridge-common-utils'
import { TPackTypeId } from '/@/components/Data/PackType'
import { App } from '/@/App'
import { getLatestFormatVersion } from '/@/components/Data/FormatVersions'

export interface IRequirements {
	targetVersion?: [TCompareOperator, string] | { min: string; max: string }
	experimentalGameplay?: string[]
	packTypes?: TPackTypeId[]
}

export interface IFailure {
	type: 'targetVersion' | 'experimentalGameplay' | 'packTypes'
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

		const matchesPackTypes = app.project.hasPacks(
			this.requires.packTypes ?? []
		)
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
		const matchesExperimentalGameplay =
			!this.requires.experimentalGameplay ||
			this.requires.experimentalGameplay.some((experimentalFeature) =>
				experimentalFeature.startsWith('!')
					? !this.experimentalGameplay[
							experimentalFeature.replace('!', '')
					  ]
					: this.experimentalGameplay[experimentalFeature]
			)

		if (!matchesPackTypes) this.failures.push({ type: 'packTypes' })
		if (!matchesTargetVersion) this.failures.push({ type: 'targetVersion' })
		if (!matchesExperimentalGameplay)
			this.failures.push({ type: 'experimentalGameplay' })

		return (
			matchesPackTypes &&
			matchesExperimentalGameplay &&
			matchesTargetVersion
		)
	}
}
