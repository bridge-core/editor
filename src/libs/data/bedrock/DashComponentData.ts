import { fileSystem } from '@/libs/fileSystem/FileSystem'
import { BedrockProject } from '@/libs/project/BedrockProject'
import { Runtime } from '@/libs/runtime/Runtime'
import { Component, DefaultConsole } from '@bridge-editor/dash-compiler'
import { Disposable, disposeAll } from '@/libs/disposeable/Disposeable'

export class DashComponentData {
	private schemas: Record<string, Record<string, any>> = {
		block: {},
		item: {},
		entity: {},
	}

	private components: Record<string, Component> = {}

	private disposables: Disposable[] = []

	public constructor(public project: BedrockProject) {}

	public async setup() {
		const componentsPath = this.project.resolvePackPath('behaviorPack', 'components')

		this.disposables.push(fileSystem.pathUpdated.on(this.pathUpdated.bind(this)))

		await this.generateSchemasInPath(componentsPath)
	}

	public dispose() {
		disposeAll(this.disposables)
	}

	public get(type: string): Record<string, any> {
		return this.schemas[type]
	}

	private async pathUpdated(path: string) {
		const componentsPath = this.project.resolvePackPath('behaviorPack', 'components')

		if (!path.startsWith(componentsPath)) return

		if (!(await fileSystem.exists(path))) {
			const componentsToRemove = Object.keys(this.components).filter((path) => path.startsWith(path))

			for (const path of componentsToRemove) {
				this.remove(path)
			}

			return
		}

		const entry = await fileSystem.getEntry(path)

		if (entry.kind === 'directory') {
			this.generateSchemasInPath(path)
		} else {
			this.generateSchema(path)
		}
	}

	private async generateSchemasInPath(path: string) {
		for (const entry of await fileSystem.readDirectoryEntries(path)) {
			if (entry.kind === 'directory') {
				await this.generateSchemasInPath(entry.path)
			} else {
				await this.generateSchema(entry.path)
			}
		}
	}

	private async generateSchema(path: string) {
		const componentsPath = this.project.resolvePackPath('behaviorPack', 'components')
		const fileType = path.replace(componentsPath + '/', '').split('/')[0]

		try {
			const script = await fileSystem.readFileText(path)

			const component = new Component(new DefaultConsole(), fileType, script, 'development', false)

			const jsRuntime = new Runtime(fileSystem)

			const loadedCorrectly = await component.load(jsRuntime, path, 'client')

			if (!loadedCorrectly) {
				console.warn('Failed to load dash component', path)

				this.remove(path)

				return
			}

			if (this.components[path]) delete this.schemas[fileType][this.components[path].name]

			this.schemas[fileType][component.name] = component.schema

			this.components[path] = component
		} catch {
			console.warn('Failed to load dash component', path)

			this.remove(path)
		}
	}

	private remove(path: string) {
		if (!this.components[path]) return

		const componentsPath = this.project.resolvePackPath('behaviorPack', 'components')
		const fileType = path.replace(componentsPath + '/', '').split('/')[0]

		const name = this.components[path].name

		delete this.schemas[fileType][name]
		delete this.components[path]
	}
}
