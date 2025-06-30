import { Component, For } from 'solid-js'
import { useTranslations } from '../../Composables/useTranslations'
import { SolidIcon } from '../../Solid/Icon/SolidIcon'
import { SolidButton } from '../../Solid/Inputs/Button/SolidButton'
import { SolidSpacer } from '../../Solid/SolidSpacer'
import { SolidWindow } from '../../Solid/Window/Window'
import { App } from '/@/App'
import { writeText } from '@tauri-apps/api/clipboard'

const ErrorWindow: Component<{
	error: Error
}> = (props) => {
	const { t } = useTranslations()

	const prettyError = () =>
		`Error: ${props.error.message}\n${props.error.stack ?? ''}`

	const onCopyError = () => {
		if (import.meta.env.VITE_IS_TAURI_APP) {
			writeText(prettyError())
		} else {
			navigator.clipboard.writeText(prettyError())
		}
	}
	const onReportBug = () => {
		App.openUrl(
			`https://github.com/bridge-core/editor/issues/new?assignees=&labels=bug&template=bug_report.md&title=${prettyError()}`
		)
	}

	return (
		<div class="p-2 w-96 h-72 flex flex-col items-center justify-center">
			<div class="flex grow-0 items-center">
				<SolidIcon
					size={3}
					color="error"
					icon="mdi-alert-circle-outline"
					class="mr-2"
				/>
				<h1 class="text-3xl font-bold">{t('general.error')}</h1>
			</div>

			<p class="grow-0 text-lg text-center">
				{t('windows.error.explanation')}
			</p>

			<div class="text-sm opacity-80 text-center">
				{props.error.message}
			</div>

			<SolidSpacer />

			<div class="flex grow-0 w-full h-min items-start">
				<SolidSpacer />

				{/* Report bug on GitHub */}
				<SolidButton class="mr-1" onClick={onReportBug}>
					<SolidIcon class="mr-1" icon="mdi-github" />
					<span>{t('general.reportBug')}</span>
				</SolidButton>

				{/* Copy error message button */}
				<SolidButton color="primary" onClick={onCopyError}>
					<SolidIcon class="mr-1" icon="mdi-content-copy" />
					<span>
						{t('actions.copy.name')} {t('general.error')}
					</span>
				</SolidButton>
			</div>
		</div>
	)
}

interface IErrorWindowOpts {
	error: Error
}

export function openErrorWindow({ error }: IErrorWindowOpts) {
	new SolidWindow(ErrorWindow, { error })
}
