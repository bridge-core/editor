import { App } from '/@/App'
import { Signal } from '/@/components/Common/Event/Signal'

export class CommandData extends Signal<void> {
	protected _schema?: Record<string, any>

	protected get schema() {
		if (!this._schema)
			throw new Error(`Acessing commandData before it was loaded.`)
		return this._schema
	}

	async loadCommandData(packageName: string) {
		const app = await App.getApp()

		this._schema = await app.fileSystem.readJSON(
			`data/packages/${packageName}/language/mcfunction/main.json`
		)
		this.dispatch()
	}

	allCommands(): string[] {
		return this.schema.vanilla.map((command: any) => command.commandName)
	}

	getCompletionItemsForArgument(
		commandName: string,
		index: number
	): string[] {
		const currentCommand = this.schema.vanilla.find(
			(command: any) => command.commandName === commandName
		)
		if (!currentCommand) return []

		// TODO: This code needs to become more clever to eventually support recursive commands like /execute
		const argument = currentCommand.arguments[index]
		if (!argument) return []

		switch (argument.type) {
			case 'selector':
				return ['@a', '@e', '@p', '@s', '@r', '@initiator']
			case 'boolean':
				return ['true', 'false']
			case 'coordinates':
				return ['~ ~ ~', '^ ^ ^']
			case 'string':
				return argument.additionalData?.values ?? []
			case 'jsonData':
				return ['{}']
			case 'blockState':
				return ['[]']
		}

		return []
	}
}
