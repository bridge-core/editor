import { Component } from 'solid-js'
import { useTranslations } from '../../Composables/useTranslations'
import { SolidIcon } from '../../Solid/Icon/SolidIcon'
import { SolidButton } from '../../Solid/Inputs/Button/SolidButton'
import { SolidBridgeLogo } from '../../Solid/Logo'
import { SolidSpacer } from '../../Solid/SolidSpacer'
import { SolidWindow } from '../../Solid/Window/Window'

interface IProps {
	version: string
	onClick: () => void
}
const UpdateWindow: Component<IProps> = (props) => {
	const { t } = useTranslations()

	return (
		<div class="p-2 w-96 h-72 flex flex-col items-center justify-center">
			<SolidBridgeLogo class="w-24 h-24 my-2" />
			<h1 class="mb-4 text-4xl font-semibold">
				bridge. v{props.version}
			</h1>
			<h2 class="text-lg font-light">Update Available!</h2>

			<SolidSpacer />

			<div class="flex grow-0 w-full h-min items-start">
				<SolidSpacer />
				<SolidButton color="primary" onClick={props.onClick}>
					<SolidIcon icon="mdi-download" />
					{t('general.installNow')}
				</SolidButton>
			</div>
		</div>
	)
}

export function openUpdateWindow(props: IProps) {
	const window = new SolidWindow(UpdateWindow, {
		...props,
		onClick: () => {
			window.close()
			props.onClick()
		},
	})
}
