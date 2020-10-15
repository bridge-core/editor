import Peer, { DataConnection } from 'peerjs'
import Vue from 'vue'
import { on } from './EventSystem'

interface IPeerState {
	isHost: boolean
	peerId: string | null
	onPeerReady?: () => void
}

export const peerState = Vue.observable<IPeerState>({
	isHost: true,
	peerId: null,
})
const peer = new Peer({})

peer.on('open', (id: string) => {
	console.log('Start hosting on: ' + id)
	peerState.peerId = id
	peerState.onPeerReady?.()
})
peer.on('error', console.error)

let connections = new Set<DataConnection>()
const updateBuffer = new Map<DataConnection, any[]>()

export async function connectToPeer(id: string, callback: (data: any) => void) {
	console.log('Connecting to peer: ' + id)
	peerState.isHost = false
	const connection = peer.connect(id)
	console.log(connection)
	await setupConnection(connection, callback)
	console.log('Connection established.')
	connections.add(connection)
}

export function startHosting(callback?: (data: any) => void) {
	peerState.isHost = true
	peer.on('connection', connection => {
		setupConnection(connection, callback)
	})
}

export function setupConnection(
	connection: DataConnection,
	callback?: (data: any) => void
) {
	connections.add(connection)

	const promise = new Promise<void>((resolve, reject) => {
		console.log('PROMISE')
		connection.on('error', reject)
		connection.on('close', () => closeConnection(connection))
		connection.on('open', () => {
			connection.on('data', callback ?? (() => {}))

			if (updateBuffer.has(connection)) {
				const dataArr = updateBuffer.get(connection) as any[]
				dataArr.forEach(data => connection.send(data))
				updateBuffer.delete(connection)
			}
			resolve()
		})
	})

	return promise
}

export function closeConnection(connection: DataConnection) {
	connections.delete(connection)
	updateBuffer.delete(connection)
}

export function sendMessage(data: any) {
	connections.forEach(connection => {
		if (connection.open) connection.send(data)
		else if (updateBuffer.has(connection))
			updateBuffer.get(connection)?.push(data)
		else updateBuffer.set(connection, [data])
	})
}

on('bridge:remoteAction', (data: any) => {
	if (!peerState.isHost) {
		sendMessage(data)
	}
})
