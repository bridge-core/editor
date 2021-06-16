export function inSelector(command: string) {
	return command.indexOf('[') > command.indexOf(']')
}
