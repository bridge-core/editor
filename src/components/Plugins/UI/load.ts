import { extname, basename, relative } from 'path'
import { createErrorNotification } from '@/AppCycle/Errors'
import { TUIStore } from './store'
import { IDisposable } from '@/types/disposable'
import { executeScript } from '../Scripts/execute'
import { createStyleSheet } from '../Styles/createStyle'
import { parseComponent } from 'vue-template-compiler'
import Vue from 'vue'
import { FileSystem } from '@/components/FileSystem/Main'

export async function loadUIComponents(
	fileSystem: FileSystem,
	pluginPath: string,
	uiStore: TUIStore,
	disposables: IDisposable[],
	basePath = pluginPath
) {
	let dirents: (FileSystemDirectoryHandle | FileSystemFileHandle)[] = []
	try {
		dirents = await fileSystem.readdir(pluginPath, { withFileTypes: true })
	} catch {}

	await Promise.all(
		dirents.map(dirent => {
			if (dirent.kind === 'directory')
				return loadUIComponent(
					fileSystem,
					`${pluginPath}/${dirent.name}`,
					basePath,
					uiStore,
					disposables
				)
			else
				return loadUIComponents(
					fileSystem,
					`${pluginPath}/${dirent.name}`,
					uiStore,
					disposables,
					pluginPath
				)
		})
	)
}

export async function loadUIComponent(
	fileSystem: FileSystem,
	componentPath: string,
	basePath: string,
	uiStore: TUIStore,
	disposables: IDisposable[]
) {
	if (extname(componentPath) !== '.vue') {
		createErrorNotification(
			new Error(
				`NOT A VUE FILE: Provided UI file "${basename(
					componentPath
				)}" is not a vue file!`
			)
		)
		return
	}

	const promise = new Promise(async (resolve, reject) => {
		//@ts-expect-error "errors" is not defined in .d.ts file
		const { template, script, styles, errors } = parseComponent(
			await (await fileSystem.readFile(componentPath)).text()
		)

		if (errors.length > 0) {
			;(errors as Error[]).forEach(error =>
				createErrorNotification(error)
			)
			return reject(errors[0])
		}

		const component = {
			name: basename(componentPath),
			...(await (<any>(
				executeScript(
					script?.content?.replace('export default', 'return') ?? '',
					uiStore,
					disposables
				)
			))),
			...Vue.compile(
				template?.content ?? `<p color="red">NO TEMPLATE DEFINED</p>`
			),
		}

		styles.forEach(style =>
			disposables.push(createStyleSheet(style.content))
		)

		resolve(component)
	})

	uiStore.set(
		relative(basePath, componentPath).split(/\\|\//g),
		() => promise
	)
}
