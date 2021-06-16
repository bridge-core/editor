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

	getArgumentsOfCommand(commandName: string, index: number) {}
}
