import './Errors'
import './ResizeWatcher'
import { createNotification } from '@/components/Footer/create'
import { setupSidebar } from '@/components/Sidebar/setup'
import { setupDefaultMenus } from '@/components/Toolbar/setupDefaults'
import { Discord as DiscordWindow } from '@/components/Windows/Discord/definition'
import { setupKeyBindings } from './keyBindings'
import { FileSystem } from '@/fileSystem/Main'
import { connectToPeer, peerState, sendMessage, startHosting } from './Peer'
import { createInformationWindow } from '@/components/Windows/Common/CommonDefinitions'
import { RemoteFileSystem } from '@/fileSystem/Remote'
import { trigger } from './EventSystem'

export async function startUp() {
	setupKeyBindings()
	setupDefaultMenus()
	setupSidebar()

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

	// if (!peerState.peerId) peerState.onPeerReady = () => peerNotification()
	// else peerNotification()

	const urlParams = new URLSearchParams(window.location.search)
	const joinPeer = urlParams.get('join')
	console.log(joinPeer)
	if (joinPeer) {
		peerState.onPeerReady = async () => {
			await connectToPeer(joinPeer, data => {
				trigger(`bridge:remoteResponse(${data.id})`, data)
			})
			RemoteFileSystem.create()
		}
	} else {
		peerState.onPeerReady = () => {
			startHosting(async ({ action, args, id }: any) => {
				if (action.startsWith('fs.')) {
					let response = await ((await FileSystem.get()) as any)[
						action.replace('fs.', '')
					]?.(...args)

					if (action === 'fs.readdir' && args[1].withFileTypes)
						response = response.map((handle: any) => ({
							name: handle.name,
							kind: handle.kind,
						}))

					sendMessage({
						id,
						response,
					})
				}
			})
		}
		FileSystem.create()
	}
}

function peerNotification() {
	createNotification({
		icon: 'mdi-share',
		message: 'Project Share Ready',
		textColor: 'white',
		onClick: () => {
			createInformationWindow(
				'Project Sharing',
				peerState.peerId as string,
				() => {
					navigator.clipboard.writeText(peerState.peerId as string)
					startHosting(console.log)
				}
			)
		},
	})
}
