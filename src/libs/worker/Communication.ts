import { v4 as uuid } from 'uuid'

/**
 * Sends a message to a web worker and waits untill the web worker responds with the same message id
 * @param message An object of message data
 * @param worker The web worker to send the message to
 * @param transfer An optional list of items to be transfered to the web worker
 * @returns The response data of the worker
 */
export async function sendAndWait(
	message: {
		[key: string]: any
	},
	worker?: Worker,
	transfer?: Transferable[]
): Promise<any> {
	let functionToUnbind: any = null

	const response = await new Promise((resolve) => {
		let messageId = uuid()

		function recieveMessage(event: MessageEvent) {
			if (!event.data) return
			if (event.data.id !== messageId) return

			resolve(event.data)
		}

		functionToUnbind = recieveMessage

		if (worker) {
			worker.addEventListener('message', functionToUnbind)
		} else {
			addEventListener('message', functionToUnbind)
		}

		if (worker) {
			if (transfer) {
				worker.postMessage(
					{
						...message,
						id: messageId,
					},
					transfer
				)
			} else {
				worker.postMessage({
					...message,
					id: messageId,
				})
			}
		} else {
			if (transfer) {
				postMessage(
					{
						...message,
						id: messageId,
					},
					'/',
					transfer
				)
			} else {
				postMessage({
					...message,
					id: messageId,
				})
			}
		}
	})

	if (worker) {
		worker.removeEventListener('message', functionToUnbind)
	} else {
		removeEventListener('message', functionToUnbind)
	}

	return response
}
