import { IFailure, IRequirements } from './RequiresMatcher'
import { App } from '/@/App'

export async function createFailureMessage(
	failure: IFailure,
	requirements: IRequirements
) {
	const app = await App.getApp()

	const failureMessageHeader = app.locales.translate(
		`windows.createPreset.disabledPreset.${failure.type}`
	)
	let failureMessageDetails
	switch (failure.type) {
		case 'experimentalGameplay':
			if (requirements.experimentalGameplay)
				failureMessageDetails = requirements.experimentalGameplay
					.map(
						(exp) =>
							`${
								exp.startsWith('!')
									? app.locales.translate('general.no')
									: ''
							} ${app.locales.translate(
								`experimentalGameplay.${exp.replace(
									'!',
									''
								)}.name`
							)}`
					)
					.join(', ')

			break
		case 'packTypes':
			if (requirements.packTypes)
				failureMessageDetails = requirements.packTypes
					.map(
						(packType) =>
							`${
								packType.startsWith('!')
									? app.locales.translate('general.no')
									: ''
							} ${app.locales.translate(
								`packType.${packType.replace('!', '')}.name`
							)}`
					)
					.join(', ')

			break
		case 'targetVersion':
			if (Array.isArray(requirements.targetVersion))
				failureMessageDetails = requirements.targetVersion.join(' ')
			else if (
				requirements.targetVersion &&
				requirements.targetVersion.min &&
				requirements.targetVersion.max
			)
				failureMessageDetails = `Min: ${requirements.targetVersion.min} | Max: ${requirements.targetVersion.max}`
			break
		case 'manifestDependency':
			if (requirements.dependencies)
				failureMessageDetails = requirements.dependencies.join(', ')
			break
	}

	return failureMessageDetails
		? `${failureMessageHeader}: ${failureMessageDetails}`
		: undefined
}
