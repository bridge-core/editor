import './Errors'
import './ResizeWatcher'
import { createNotification } from '@/components/Footer/create'
import { setupSidebar } from '@/components/Sidebar/setup'
import { setupDefaultMenus } from '@/components/Toolbar/setupDefaults'
import { Discord as DiscordWindow } from '@/components/Windows/Discord/definition'
import { setupKeyBindings } from './keyBindings'
import { FileType } from './FileType'
import { setupMonacoEditor } from '@/components/Editors/Text/setup'
import { translate, selectLanguage, getLanguages } from '@/utils/locales'

export async function startUp() {
	setupKeyBindings()
	setupDefaultMenus()
	setupSidebar()
	await FileType.setup()
	setupMonacoEditor()

	// Set language based off of browser language
	if (!navigator.language.includes('en')) {
		for (const [lang] of getLanguages()) {
			if (navigator.language.includes(lang)) {
				selectLanguage(lang)
			}
		}
	} else {
		selectLanguage('en')
	}

	if (process.env.NODE_ENV !== 'development') {
		const discordMsg = createNotification({
			icon: 'mdi-discord',
			message: 'Discord Server',
			color: '#7289DA',
			textColor: 'white',
			onClick: () => {
				DiscordWindow.open()
				discordMsg.dispose()
			},
		})
	}

	if (process.env.NODE_ENV !== 'development') {
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
