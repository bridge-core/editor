import { BedrockProject } from '@/libs/project/BedrockProject'
import { Data } from '../Data'

export interface Argument {
	type:
		| 'string'
		| 'boolean'
		| 'selector'
		| '$coordinates'
		| 'number'
		| 'coordinate'
		| 'blockState'
		| 'subcommand'
		| 'command'
	argumentName: string
	additionalData?: {
		values?: string[]
		schemaReference?: string
	}
	isOptional?: boolean
}

export interface SelectorArgument {
	type: 'string' | 'boolean' | 'scoreData' | 'number' // seperate string and identifier. name = "works" but type = "type" doesn't
	argumentName: string
	additionalData?: {
		values?: string[]
		schemaReference?: string
		multipleInstancesAllowed?: 'never' | 'whenNegated' | 'always'
		supportsNegation?: boolean
	}
}

export interface Command {
	commandName: string
	description: string
	arguments: Argument[]
}

export class CommandData {
	private data: any

	constructor(public project: BedrockProject) {}

	public async setup() {
		this.data = await Data.get(`packages/minecraftBedrock/language/mcfunction/main.json`)
	}

	public getCommands(): Command[] {
		let commands: Command[] = []

		for (const entry of this.data.vanilla) {
			if (entry.requires !== undefined && !this.project.requirementsMatcher.matches(entry.requires)) continue

			commands = commands.concat(entry.commands)
		}

		return commands
	}

	public getSubcommands(): Command[] {
		let commands: Command[] = []

		for (const entry of this.data.vanilla) {
			if (entry.requires !== undefined && !this.project.requirementsMatcher.matches(entry.requires)) continue

			commands = commands.concat(entry.subcommands)
		}

		return commands
	}

	public getSelectorArguments(): SelectorArgument[] {
		return this.data.vanilla[0].selectorArguments
	}
}
