import Peer, { DataConnection } from 'peerjs'
import Vue from 'vue'
import { v4 as uuid } from 'uuid'
import './Host.ts'
import { createInformationWindow } from '@/components/Windows/Common/CommonDefinitions'

interface IPeerState {
	isHost: boolean
	peerId: string | null
	userId: string
	onPeerReady?: () => void
}

export const peerState = Vue.observable<IPeerState>({
	isHost: true,
	peerId: null,
	userId: uuid(),
})
const peer = new Peer({})

peer.on('open', (id: string) => {
	console.log('Start hosting on: ' + id)
	peerState.peerId = id
	peerState.onPeerReady?.()
})
peer.on('error', err => {
	if (!err.message.includes('Server has reached its concurrent user limit'))
		createInformationWindow(
			`ERROR`,
			`Unable to connect to workspace!`,
			() => {
				location.href = 'https://bridge-core.github.io/editor'
			}
		)
})

let connections = new Set<DataConnection>()
const updateBuffer = new Map<DataConnection, any[]>()

export async function connectToPeer(id: string, callback: (data: any) => void) {
	console.log('Connecting to peer: ' + id)
	peerState.isHost = false

	const connection = peer.connect(id)
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
	console.log('closed connection')
	connections.delete(connection)
	updateBuffer.delete(connection)
}

export function closeAllConnections() {
	connections.forEach(conn => conn.close())
}

export function sendMessage(data: any) {
	connections.forEach(connection => {
		if (connection.open) connection.send(data)
		else if (updateBuffer.has(connection))
			updateBuffer.get(connection)?.push(data)
		else updateBuffer.set(connection, [data])
	})
}

window.onbeforeunload = () => closeAllConnections()
