import { Command } from '../Command'

new (class extends Command {
	description = 'Create a new game feature'
	args = {
		'file-type': {
			type: 'string' as const,
			required: true,
		},
		'feature-name': {
			type: 'string' as const,
			required: true,
		},
	}
	command = ['create']

	execute(args: Record<string, unknown>) {
		console.log(args)
	}
})()
