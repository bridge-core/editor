import { CompareOperator, compare } from 'compare-versions'
import { TPackTypeId } from '/@/components/Data/PackType'
import { App } from '/@/App'
import { getLatestFormatVersion } from '/@/components/Data/FormatVersions'

export interface IRequirements {
	targetVersion?: [CompareOperator, string]
	experimentalGameplay?: string[]
	packTypes?: TPackTypeId[]
}

export class Requires {
	protected experimentalGameplay: Record<string, boolean> = {}
	protected projectTargetVersion: string = ''

	constructor() {}

	async update() {
		const app = await App.getApp()

		const config = app.project.config.get()

		this.experimentalGameplay = config.experimentalGameplay ?? {}
		this.projectTargetVersion =
			config.targetVersion ?? (await getLatestFormatVersion())
	}

	async meetsRequirements(requires: IRequirements) {
		if (!requires) return true

		const app = await App.getApp()

		const matchesPackTypes = app.project.hasPacks(requires.packTypes ?? [])
		const matchesTargetVersion =
			!requires.targetVersion ||
			compare(
				this.projectTargetVersion,
				requires.targetVersion[1],
				requires.targetVersion[0]
			)
		const matchesExperimentalGameplay =
			!requires.experimentalGameplay ||
			requires.experimentalGameplay.some((experimentalFeature) =>
				experimentalFeature.startsWith('!')
					? !this.experimentalGameplay[
							experimentalFeature.replace('!', '')
					  ]
					: this.experimentalGameplay[experimentalFeature]
			)

		return (
			matchesPackTypes &&
			matchesExperimentalGameplay &&
			matchesTargetVersion
		)
	}
}
