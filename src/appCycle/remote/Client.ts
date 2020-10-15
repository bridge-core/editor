import { on, trigger } from '../EventSystem'
import { peerState, sendMessage } from './Peer'
import { v4 as uuid } from 'uuid'
import { handleTabSystemRequest } from './Host'

on('bridge:remoteAction', (data: any) => {
	if (!peerState.isHost) {
		sendMessage(data)
	}
})

const ownBroadcasts = new Set<string>()
export function onReceiveData(data: any) {
	if (data.isBroadcast && ownBroadcasts.has(data.id)) {
		ownBroadcasts.delete(data.id)
		return
	}

	if (data.response) {
		trigger(`bridge:remoteResponse(${data.id})`, data)
	} else if (data.module === 'tabSystem') {
		handleTabSystemRequest(data.action, data.id, data.args)
	} else if (data.module === 'textEditorTab') {
		trigger(`bridge:remote.textEditorTab.${data.action}`, ...data.args)
	}
}

export function dispatchRemoteAction(
	module: string,
	action: string,
	...args: unknown[]
) {
	return new Promise(resolve => {
		const id = uuid()
		const listener = on(`bridge:remoteResponse(${id})`, (data: any) => {
			resolve(data.response)
			listener.dispose()
		})

		trigger('bridge:remoteAction', {
			module,
			action,
			args,
			id,
		})
	})
}

export function dispatchEvent(
	module: string,
	event: string,
	...args: unknown[]
) {
	const id = uuid()
	ownBroadcasts.add(id)

	sendMessage({
		isBroadcast: true,
		module,
		action: event,
		args,
		id: id,
	})
}
