import { Project } from '/@/components/Projects/Project/Project'
import { InformedChoiceWindow } from '/@/components/Windows/InformedChoice/InformedChoice'
import { Compiler } from './Compiler'
import JSON5 from 'json5'

export class CompilerManager {
	protected compilers = new Map<string, Compiler>()
	protected compilerPlugins = new Map<string, string>()

	constructor(protected project: Project) {}

	async start(configName: string, mode: 'dev' | 'build') {
		let compiler = this.compilers.get(configName)
		// Compiler for this config already exists, just start it
		if (compiler) return compiler.activate(mode)

		compiler = new Compiler(this, this.project, configName)
		this.compilers.set(configName, compiler)
		await compiler.activate(mode)
	}

	updateFile(configName: string, filePath: string) {
		let compiler = this.compilers.get(configName)

		if (!compiler)
			throw new Error(
				`Cannot update file because compiler for config "${configName}" doesn't exist`
			)
		return compiler.updateFile(filePath)
	}

	remove(configName: string) {
		this.compilers.delete(configName)
	}

	addCompilerPlugin(pluginId: string, srcPath: string) {
		if (this.compilerPlugins.has(pluginId))
			throw new Error(
				`Compiler plugin with id "${pluginId}" is already registered`
			)
		this.compilerPlugins.set(pluginId, srcPath)

		return {
			dispose: () => this.compilerPlugins.delete(pluginId),
		}
	}

	getCompilerPlugins() {
		return Object.fromEntries(this.compilerPlugins.entries())
	}
	async openWindow() {
		const configDir = await this.project.fileSystem.getDirectoryHandle(
			`bridge/compiler`,
			{ create: true }
		)
		const informedChoice = new InformedChoiceWindow('sidebar.compiler.name')
		const actionManager = await informedChoice.actionManager
		for await (const entry of configDir.values()) {
			if (entry.kind !== 'file' || entry.name === '.DS_Store') continue
			const file = await entry.getFile()

			let config
			try {
				config = JSON5.parse(await file.text())
			} catch {
				continue
			}

			actionManager.create({
				icon: config.icon,
				name: config.name,
				description: config.description,
				onTrigger: () => this.start(entry.name, 'build'),
			})
		}
	}
}
