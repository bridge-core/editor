/**
 * A module that emulates bridge. v1's custom command environment
 */
export const v1Compat = (module: any) => ({
	register: (commandClass: any) => {
		module.exports = ({ name, schema, template }: any) => {
			name(commandClass.command_name)
			schema([])

			template((commandArgs: any) => {
				const command = new commandClass()

				return command.onApply(commandArgs)
			})
		}
	},
})
