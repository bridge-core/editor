import { BedrockProject } from '@/libs/project/BedrockProject'
import { Data } from '../Data'

export class CommandData {
	private data: any

	constructor(public project: BedrockProject) {}

	public async setup() {
		this.data = await Data.get(`packages/minecraftBedrock/language/mcfunction/main.json`)
	}

	public getCommands(): string[] {
		let commands: string[] = []

		for (const entry of this.data.vanilla) {
			if (entry.requires !== undefined && !this.project.requirementsMatcher.matches(entry.requires)) continue

			commands = commands.concat(entry.commands.map((command: any) => command.commandName))
		}

		return commands
	}

	public getSelectorArgumentNames(): string[] {
		return this.data.vanilla[0].selectorArguments.map((argument: any) => argument.argumentName)
	}
}
