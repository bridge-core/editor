import { fileSystem, iterateDirectory } from '@/libs/fileSystem/FileSystem'
import { basename, join } from 'pathe'
import { dark, light } from '@/libs/theme/DefaultThemes'
import { Theme } from '@/libs/theme/Theme'
import { Snippet, SnippetData } from '@/libs/snippets/Snippet'
import { TBaseModule } from '@bridge-editor/js-runtime/dist/Runtime'
import { Event } from '@/libs/event/Event'
import { Runtime as BridgeRuntime, initRuntimes, Module } from '@bridge-editor/js-runtime'
import wasmUrl from '@swc/wasm-web/wasm-web_bg.wasm?url'
import { BaseFileSystem } from '@/libs/fileSystem/BaseFileSystem'
import { Component } from 'vue'

export type ExtensionModuleBuilder = (extension: Extension) => TBaseModule

class ExtensionRuntime extends BridgeRuntime {
	private uiRegistry: { [key: string]: Component }

	constructor(public fileSystem: BaseFileSystem, modules?: [string, TBaseModule][]) {
		initRuntimes(wasmUrl)

		let componentRegistry = {}

		const uiProxy = new Proxy(componentRegistry, {
			get(target, property, receiver) {
				if (property === 'then') return Promise.resolve()

				console.log('Reading component >', property)

				console.trace()

				return property
			},
		})

		super(modules === undefined ? undefined : [...modules, ['__@bridge__/vue-components', uiProxy]])

		this.uiRegistry = componentRegistry
	}

	async readFile(filePath: string): Promise<File> {
		console.log(filePath)

		// @ts-ignore
		if (!(await this.fileSystem.exists(filePath))) return undefined

		const file = await this.fileSystem.readFile(filePath)

		if (filePath.endsWith('.vue'))
			// @ts-ignore
			return {
				name: basename(filePath),
				type: 'unkown',
				size: file.byteLength,
				lastModified: Date.now(),
				webkitRelativePath: filePath,

				text: async () => `
					import * as components from "__@bridge__/vue-components"
					export default components["${filePath}"]
				`,
			}

		// @ts-ignore
		return {
			name: basename(filePath),
			type: 'unkown',
			size: file.byteLength,
			lastModified: Date.now(),
			webkitRelativePath: filePath,

			arrayBuffer: () => Promise.resolve(file),
			slice: () => new Blob(),
			stream: () => new ReadableStream(),
			text: async () => await new TextDecoder().decode(file),
		}
	}
}

export interface ExtensionManifest {
	author: string
	description: string
	icon: string
	id: string
	link: string
	name: string
	tags: string[]
	target: 'v1' | 'v2' | 'both' | 'v2.1'
	version: string
	releaseTimestamp: number
	contributeFiles: Record<string, { path: string; pack: string }>
}

export class Extension {
	public id: string = 'unloaded'

	private manifest: ExtensionManifest | null = null
	public themes: Theme[] = []
	public presets: any = {}
	public snippets: Snippet[] = []
	public ui: Record<string, any> = {}
	public modules: [string, TBaseModule][] = []
	public deactivated: Event<void> = new Event()

	private static moduleBuilders: Record<string, ExtensionModuleBuilder> = {}

	constructor(public path: string) {}

	public async load() {
		const manifest: ExtensionManifest = await fileSystem.readFileJson(join(this.path, 'manifest.json'))

		this.id = manifest.id
		this.manifest = manifest

		const themesPath = join(this.path, 'themes')
		if (await fileSystem.exists(themesPath)) {
			for (const entry of await fileSystem.readDirectoryEntries(themesPath)) {
				const theme: Theme = await fileSystem.readFileJson(entry.path)

				const base = theme.colorScheme === 'dark' ? dark : light

				if (manifest.target !== 'v2.1') {
					theme.colors.menuAlternate = theme.colors.sidebarNavigation
					theme.colors.accent = base.colors.text
				}

				theme.colors = {
					...base.colors,
					...theme.colors,
				}

				this.themes.push(theme)
			}
		}

		const presetPath = join(this.path, 'presets.json')
		if (await fileSystem.exists(presetPath)) {
			const presets = await fileSystem.readFileJson(presetPath)

			this.presets = Object.fromEntries(Object.entries(presets).map(([path, value]) => [join(this.path, path), value]))
		}

		const snippetsPath = join(this.path, 'snippets')
		if (await fileSystem.exists(snippetsPath)) {
			for (const entry of await fileSystem.readDirectoryEntries(snippetsPath)) {
				const snippet: SnippetData = await fileSystem.readFileJson(entry.path)

				this.snippets.push(new Snippet(snippet))
			}
		}

		console.log('[Extension] Loaded:', this.manifest.name)
	}

	public async activate() {
		this.buildModules()

		await this.runScripts()

		console.log('[Extension] Activated:', this.manifest?.name ?? `Invalid (${this.id})`)
	}

	public async deactivate() {
		this.deactivated.dispatch()

		console.log('[Extension] Deactivated:', this.manifest?.name ?? `Invalid (${this.id})`)
	}

	public static registerModule(name: string, module: ExtensionModuleBuilder) {
		Extension.moduleBuilders[name] = module
	}

	public buildModules() {
		this.modules = Object.entries(Extension.moduleBuilders).map(([id, moduleBuilder]) => [id, moduleBuilder(this)])
	}

	private async runScripts() {
		const runtime = new ExtensionRuntime(fileSystem, this.modules)

		const promises: Promise<any>[] = []

		const scriptsPath = join(this.path, 'scripts')
		if (await fileSystem.exists(scriptsPath)) {
			iterateDirectory(fileSystem, scriptsPath, (entry) => {
				promises.push(runtime.run(entry.path))
			})
		}

		await Promise.all(promises)
	}
}
