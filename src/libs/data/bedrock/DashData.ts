import { fileSystem } from '@/libs/fileSystem/FileSystem'
import { BedrockProject } from '@/libs/project/BedrockProject'
import { Runtime } from '@/libs/runtime/Runtime'
import { Command, Component, DefaultConsole } from '@bridge-editor/dash-compiler'
import { Disposable, disposeAll } from '@/libs/disposeable/Disposeable'

export class DashData implements Disposable {
	private schemas: Record<string, Record<string, any>> = {
		block: {},
		item: {},
		entity: {},
		command: {},
	}

	private components: Record<string, Component> = {}
	private commands: Record<string, Command> = {}

	private disposables: Disposable[] = []

	private componentsPath: string = ''
	private commandsPath: string = ''

	public constructor(public project: BedrockProject) {}

	public async setup() {
		this.componentsPath = this.project.resolvePackPath('behaviorPack', 'components')
		this.commandsPath = this.project.resolvePackPath('behaviorPack', 'commands')

		this.disposables.push(
			fileSystem.pathUpdated.on((path: unknown) => {
				this.pathUpdated(path as string)
			})
		)

		if (await fileSystem.exists(this.componentsPath)) await this.generateSchemasInPath(this.componentsPath)
		if (await fileSystem.exists(this.commandsPath)) await this.generateSchemasInPath(this.commandsPath)
	}

	public dispose() {
		disposeAll(this.disposables)
	}

	public get(type: string): Record<string, any> {
		return this.schemas[type]
	}

	private async pathUpdated(path: string) {
		if (!path.startsWith(this.componentsPath) && !path.startsWith(this.commandsPath)) return

		if (!(await fileSystem.exists(path))) {
			const componentsToRemove = Object.keys(this.components).filter((path) => path.startsWith(path))

			for (const path of componentsToRemove) {
				this.removeComponent(path)
			}

			return
		}

		const entry = await fileSystem.getEntry(path)

		if (entry.kind === 'directory') {
			this.generateSchemasInPath(path)
		} else {
			if (path.startsWith(this.componentsPath)) {
				await this.generateComponentSchema(entry.path)
			} else {
				await this.generateCommandSchema(entry.path)
			}
		}
	}

	private async generateSchemasInPath(path: string) {
		for (const entry of await fileSystem.readDirectoryEntries(path)) {
			if (entry.kind === 'directory') {
				await this.generateSchemasInPath(entry.path)
			} else {
				if (path.startsWith(this.componentsPath)) {
					await this.generateComponentSchema(entry.path)
				} else {
					await this.generateCommandSchema(entry.path)
				}
			}
		}
	}

	private async generateCommandSchema(path: string) {
		try {
			const script = await fileSystem.readFileText(path)

			const command = new Command(new DefaultConsole(), script, 'development', false)

			const jsRuntime = new Runtime(fileSystem)

			const loadedResult = await command.load(jsRuntime, path, 'client')
			// NOTE: Dash compiler doesn't return a truthy value when the command loads so doing this a temporary fix untill I update the dash compiler again
			const loadedCorrectly = loadedResult !== null && loadedResult !== false

			if (!loadedCorrectly || !command.name || !command.getSchema()) {
				console.warn('Failed to load dash command', path)

				this.removeCommand(path)

				return
			}

			if (this.components[path]) delete this.schemas.command[this.components[path].name!]

			this.schemas.command[command.name] = command.getSchema()

			this.commands[path] = command
		} catch {
			console.warn('Failed to load dash command', path)

			this.removeCommand(path)
		}
	}

	private async generateComponentSchema(path: string) {
		const fileType = path.replace(this.componentsPath + '/', '').split('/')[0]

		try {
			const script = await fileSystem.readFileText(path)

			const component = new Component(new DefaultConsole(), fileType, script, 'development', false)

			const jsRuntime = new Runtime(fileSystem)

			const loadedCorrectly = await component.load(jsRuntime, path, 'client')

			if (!loadedCorrectly || !component.name || !component.getSchema()) {
				console.warn('Failed to load dash component', path)

				this.removeComponent(path)

				return
			}

			if (this.components[path]) delete this.schemas[fileType][this.components[path].name!]

			this.schemas[fileType][component.name] = component.getSchema()

			this.components[path] = component
		} catch {
			console.warn('Failed to load dash component', path)

			this.removeComponent(path)
		}
	}

	private removeComponent(path: string) {
		if (!this.components[path]) return

		const fileType = path.replace(this.componentsPath + '/', '').split('/')[0]

		const name = this.components[path].name!

		delete this.schemas[fileType][name]
		delete this.components[path]
	}

	private removeCommand(path: string) {
		if (!this.commands[path]) return

		const name = this.commands[path].name!

		delete this.schemas.command[name]
		delete this.commands[path]
	}
}
