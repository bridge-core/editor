import { mainTabSystem } from '@/components/TabSystem/Main'
import { FileSystem } from '@/components/FileSystem/Main'
import { trigger } from '../EventSystem'
import { dispatchEvent } from './Client'
import { peerState, sendMessage } from './Peer'
import { v4 as uuid } from 'uuid'

export function broadcast(
	id: string,
	module: string,
	event: string,
	...args: unknown[]
) {
	sendMessage({
		isBroadcast: true,
		module,
		action: event,
		args,
		id,
	})
}

const hostId = uuid()
export const currentActiveUsers = new Map<string, { name: string; id: string }>(
	[[hostId, { id: hostId, name: 'solvedDev' }]]
)
export async function handleRequest({
	module,
	action,
	id,
	args,
	isBroadcast,
}: any) {
	if (isBroadcast) broadcast(id, module, action, ...args)

	if (module === 'fileSystem') await handleFSRequest(action, id, args)
	else if (module === 'tabSystem')
		await handleTabSystemRequest(action, id, args)
	else if (module === 'textEditorTab')
		trigger(`bridge:remote.textEditorTab.${action}`, ...args)
	else if (module === 'bridgeApp') {
		if (action === 'userJoin') {
			currentActiveUsers.set(args[0], { name: args[1], id: args[0] })
		} else if (action === 'getActiveUsers') {
			sendMessage({ id, response: [...currentActiveUsers.values()] })
		}
	}
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
	} else if (action === 'saveTab') {
		mainTabSystem.save(mainTabSystem.getTab(args[0]))
	} else if (action === 'setUnsaved') {
		const tab = mainTabSystem.getTab(args[0])
		if (tab) {
			if (mainTabSystem.selectedTab !== tab) tab.hasRemoteChange = true
			tab.setIsUnsaved(args[1] ?? true, args[2])
		}
	}
}
