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
		| 'jsonData'
	argumentName: string
	additionalData?: {
		values?: string[]
		schemaReference?: string
	}
	isOptional?: boolean
	allowMultiple?: boolean
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

export interface Subommand {
	commandName: string
	commands: Command[]
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

		commands = commands.concat(
			Object.entries(this.project.schemaData.dashComponentsData.get('command')).flatMap(([name, schemas]) => {
				return schemas.map((schema: any) => ({
					commandName: name,
					description: schema.description,
					arguments: schema.arguments,
				}))
			})
		)

		commands = commands.filter((command) => command)

		return commands
	}

	public getSubcommands(): Subommand[] {
		let commands: Subommand[] = []

		for (const entry of this.data.vanilla) {
			if (entry.requires !== undefined && !this.project.requirementsMatcher.matches(entry.requires)) continue

			commands = commands.concat(entry.subcommands)
		}

		commands = commands.filter((command) => command)

		return commands
	}

	public getSelectorArguments(): SelectorArgument[] {
		let selectorArguments: SelectorArgument[] = []

		for (const entry of this.data.vanilla) {
			if (entry.requires !== undefined && !this.project.requirementsMatcher.matches(entry.requires)) continue

			selectorArguments = selectorArguments.concat(entry.selectorArguments)
		}

		selectorArguments = selectorArguments.filter((selectorArguments) => selectorArguments)

		return selectorArguments
	}

	public getCustomTypes(): Record<string, { type: string }[]> {
		return this.data.$customTypes
	}
}
