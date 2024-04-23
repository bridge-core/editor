import { Data } from '../Data'

export class CommandData {
	private data: any

	public async setup() {
		this.data = await Data.get(`packages/minecraftBedrock/language/mcfunction/main.json`)
	}

	public getCommandNames(): string[] {
		return this.data.vanilla[0].commands.map((command: any) => command.commandName)
	}

	public getSelectorArgumentNames(): string[] {
		return this.data.vanilla[0].selectorArguments.map((argument: any) => argument.argumentName)
	}
}
