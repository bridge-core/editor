import { createNotification } from '@/components/Footer/create'
import { setupSidebar } from '@/components/Sidebar/setup'
import { setupDefaultMenus } from '@/components/Toolbar/setupDefaults'
import './Errors'
import { setupKeyBindings } from './keyBindings'

export async function startUp() {
	setupKeyBindings()
	setupDefaultMenus()
	setupSidebar()

	if (process.env.NODE_ENV === 'development') {
		const discordMsg = createNotification({
			icon: 'mdi-discord',
			message: 'Discord Server',
			color: '#7289DA',
			textColor: 'white',
			onClick: () => {
				// DiscordWindow.open()
				discordMsg.dispose()
			},
		})
	}

	if (process.env.NODE_ENV === 'development') {
		const gettingStarted = createNotification({
			icon: 'mdi-help-circle-outline',
			message: 'Getting Started',
			textColor: 'white',
			onClick: () => {
				window.open(
					'https://bridge-core.github.io/editor-docs/getting-started/'
				)
				gettingStarted.dispose()
			},
		})
	}
}
