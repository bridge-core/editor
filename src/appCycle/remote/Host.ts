import { mainTabSystem } from '@/components/TabSystem/Main'
import { FileSystem } from '@/fileSystem/Main'
import { peerState, sendMessage } from './Peer'

export async function handleRequest({ module, action, id, args }: any) {
	if (module === 'fileSystem') await handleFSRequest(action, id, args)
	else if (module === 'tabSystem')
		await handleTabSystemRequest(action, id, args)
}

async function handleFSRequest(action: string, id: string, args: any[]) {
	const fileSystem: any = await FileSystem.get()

	let response = await fileSystem[action]?.(...args)

	if (action === 'readdir' && args[1].withFileTypes)
		response = response.map((handle: any) => ({
			name: handle.name,
			kind: handle.kind,
		}))

	sendMessage({
		id,
		response,
	})
}

export async function handleTabSystemRequest(
	action: string,
	id: string,
	args: any[]
) {
	if (action === 'getCurrentTabs' && peerState.isHost) {
		sendMessage({
			id,
			response: mainTabSystem.tabs.map(tab => tab.getPath()),
		})
	} else if (action === 'openFile') {
		mainTabSystem.open(args[0], mainTabSystem.tabs.length === 0, false)
	} else if (action === 'closeTab') {
		mainTabSystem.closeByPath(args[0], false)
	}
}
