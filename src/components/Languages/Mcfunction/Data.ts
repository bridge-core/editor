import { compare } from 'compare-versions'
import { App } from '/@/App'
import { Signal } from '/@/components/Common/Event/Signal'

export class CommandData extends Signal<void> {
	protected _data?: any
	protected _schema?: Record<string, any>

	protected async getSchema() {
		const projectTargetVersion = await App.getApp().then(
			(app) => app.project.config.get().targetVersion
		)

		if (!this._data)
			throw new Error(`Acessing commandData before it was loaded.`)

		const validEntries = this._data.vanilla.filter(
			({ targetVersion }: any) =>
				!projectTargetVersion ||
				!targetVersion ||
				compare(
					projectTargetVersion,
					targetVersion[1],
					targetVersion[0]
				)
		)

		return validEntries.map((entry: any) => entry.commands).flat()
	}

	async loadCommandData(packageName: string) {
		const app = await App.getApp()

		this._data = await app.fileSystem.readJSON(
			`data/packages/${packageName}/language/mcfunction/main.json`
		)
		// console.log(this._data)
		this.dispatch()
	}

	allCommands() {
		return this.getSchema().then((schema) => [
			...new Set<string>(
				schema.map((command: any) => command.commandName)
			),
		])
	}

	async getCompletionItemsForArgument(commandName: string, index: number) {
		const currentCommands = await this.getSchema().then((schema) =>
			schema.filter((command: any) => command.commandName === commandName)
		)
		if (!currentCommands || currentCommands.length === 0) return []

		return [
			...new Set<string>(
				currentCommands
					.map((currentCommand: any) => {
						// TODO: This code needs to become more clever to eventually support recursive commands like /execute
						const argument = currentCommand.arguments[index]
						if (!argument) return []

						switch (argument.type) {
							case 'selector':
								return [
									'@a',
									'@e',
									'@p',
									'@s',
									'@r',
									'@initiator',
								]
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
					})
					.flat()
			),
		]
	}
}
