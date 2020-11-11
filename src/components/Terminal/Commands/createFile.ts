import { TerminalCommand } from '../createCommand'

new TerminalCommand(['create', ['entity', 'item']], commandParts => {
	const createType = commandParts[1]
	console.log(createType)
})

new TerminalCommand(['create', ['project']], commandParts => {
	const createType = commandParts[1]
	console.log(createType)
})
