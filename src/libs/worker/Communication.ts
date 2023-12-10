import { v4 as uuid } from 'uuid'

export async function sendAndWait(message: {
	[key: string]: any
}): Promise<any> {
	let functionToUnbind: any = null

	const response = await new Promise((resolve) => {
		let messageId = uuid()

		function recieveMessage(event: MessageEvent) {
			if (!event.data) return
			if (event.data.id !== messageId) return

			resolve(event.data)
		}

		functionToUnbind = recieveMessage

		addEventListener('message', functionToUnbind)

		postMessage({
			...message,
			id: messageId,
		})
	})

	removeEventListener('message', functionToUnbind)

	return response
}
