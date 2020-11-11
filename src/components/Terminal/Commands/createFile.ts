import { createTerminalCommand } from '../createCommand'

createTerminalCommand(['create', ['entity', 'item']], commandParts => {
	const createType = commandParts[1]
	console.log(createType)
})
