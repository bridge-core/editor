import { For } from 'solid-js'
import { SolidIconButton } from '../../Solid/Inputs/IconButton/IconButton'
import { SolidBridgeLogo } from '../../Solid/Logo'
import { SolidWindow } from '../../Solid/Window/Window'
import { App } from '/@/App'
import { version } from '/@/utils/app/version'

const AboutWindow = () => {
	const socialLinks = [
		{
			icon: 'mdi-github',
			link: 'https://github.com/bridge-core/',
		},
		{
			icon: 'mdi-twitter',
			link: 'https://twitter.com/bridgeIde',
		},
		{
			icon: 'mdi-discord',
			link: 'https://discord.gg/jj2PmqU',
		},
	]

	return (
		<div class="w-96 h-96 flex flex-col items-center justify-center">
			<SolidBridgeLogo class="w-24 h-24 mb-2" />
			<span class="mb-4">bridge. v{version}</span>

			<div class="flex grow-0">
				<For each={socialLinks}>
					{({ icon, link }) => (
						<SolidIconButton
							onClick={() => App.openUrl(link)}
							icon={icon}
						/>
					)}
				</For>
			</div>
		</div>
	)
}

export function openAboutWindow() {
	new SolidWindow(AboutWindow)
}
