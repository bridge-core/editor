import { Project } from '/@/components/Projects/Project/Project'
import { InformedChoiceWindow } from '/@/components/Windows/InformedChoice/InformedChoice'
import { Compiler } from './CompilerWorker'
import JSON5 from 'json5'
import { App } from '/@/App'
import { deepMergeAll } from '/@/utils/deepmerge'
import { Signal } from '../Common/Event/Signal'
import { InfoPanel, IPanelOptions } from '../InfoPanel/InfoPanel'
import { isUsingFileSystemPolyfill } from '../FileSystem/Polyfill'

export class CompilerManager extends Signal<void> {
	protected compilers = new Map<string, Compiler>()

	constructor(protected project: Project) {
		super()
	}

	async start(
		configName: string,
		mode: 'dev' | 'build',
		restartDevServer = false
	) {
		const app = await App.getApp()
		await app.extensionLoader.fired
		await app.comMojang.fired

		if (
			await this.project.fileSystem.fileExists(
				'.bridge/.restartDevServer'
			)
		) {
			restartDevServer = true
			await this.project.fileSystem.unlink('.bridge/.restartDevServer')
		}

		let compiler = this.compilers.get(configName)
		// Compiler for this config already exists, just start it
		if (compiler) return compiler.activate({ mode, restartDevServer })

		compiler = new Compiler(this, this.project, configName)
		this.compilers.set(configName, compiler)
		await compiler.activate({ mode, restartDevServer })
		this.dispatch()
	}

	get current() {
		let compiler = this.compilers.get('default')

		if (!compiler) throw new Error(`Cannot get current compiler`)

		return compiler
	}

	updateFiles(configName: string, filePaths: string[]) {
		let compiler = this.compilers.get(configName)

		if (!compiler)
			throw new Error(
				`Cannot update file because compiler for config ".bridge/compiler/${configName}" doesn't exist`
			)
		return compiler.updateFiles(filePaths)
	}
	unlink(path: string) {
		let compiler = this.compilers.get('default')

		if (!compiler)
			throw new Error(
				`Cannot update file because compiler for config ".bridge/compiler/default" doesn't exist`
			)

		return compiler.unlink(path)
	}

	compileWithFile(filePath: string, file: File) {
		let compiler = this.compilers.get('default')

		if (!compiler)
			throw new Error(
				`Cannot update file because compiler for config ".bridge/compiler/default" doesn't exist`
			)
		return compiler.compileWithFile(filePath, file)
	}

	remove(configName: string) {
		this.compilers.delete(configName)
	}
	deactivate() {
		this.compilers.forEach((compiler) => compiler.deactivate())
	}
	dispose() {
		this.compilers.forEach((compiler) => compiler.dispose())
	}

	getCompilerPlugins() {
		return deepMergeAll(
			this.project.app.extensionLoader.mapActive<Record<string, string>>(
				(ext) => ext.compilerPlugins
			)
		)
	}
	async openWindow() {
		const comMojang = this.project.app.comMojang
		const { hasComMojang, didDenyPermission } = comMojang.status

		const configDir = await this.project.fileSystem.getDirectoryHandle(
			`.bridge/compiler`,
			{ create: true }
		)
		const informedChoice = new (class extends InformedChoiceWindow {
			constructor() {
				super('sidebar.compiler.name')

				let panelConfig: IPanelOptions

				if (isUsingFileSystemPolyfill) {
					panelConfig = {
						text: 'comMojang.status.notAvailable',
						type: 'error',
						isDismissible: false,
					}
				} else if (!hasComMojang && didDenyPermission) {
					panelConfig = {
						text: 'comMojang.status.deniedPermission',
						type: 'warning',
						isDismissible: false,
					}
				} else if (hasComMojang && !didDenyPermission) {
					panelConfig = {
						text: 'comMojang.status.sucess',
						type: 'success',
						isDismissible: false,
					}
				} else if (!hasComMojang) {
					panelConfig = {
						text: 'comMojang.status.notSetup',
						type: 'error',
						isDismissible: false,
					}
				} else {
					throw new Error(`Invalid com.mojang status`)
				}

				this.topPanel = new InfoPanel(panelConfig)
			}
		})()

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
