import { extname, basename, relative } from '/@/utils/path'
import { createErrorNotification } from '/@/components/Notifications/Errors'
import { TUIStore } from './store'
import { IDisposable } from '/@/types/disposable'
import { executeScript } from '../Scripts/loadScripts'
import { createStyleSheet } from '../Styles/createStyle'
import { parseComponent } from 'vue-template-compiler'
import Vue from 'vue'
import { FileSystem } from '/@/components/FileSystem/FileSystem'
// @ts-ignore
import * as VuetifyComponents from 'vuetify/lib/components'
import { AnyDirectoryHandle, AnyFileHandle } from '../../FileSystem/Types'

export async function loadUIComponents(
	fileSystem: FileSystem,
	uiStore: TUIStore,
	disposables: IDisposable[],
	basePath = 'ui'
) {
	let dirents: (AnyDirectoryHandle | AnyFileHandle)[] = []
	try {
		dirents = await fileSystem.readdir(basePath, { withFileTypes: true })
	} catch {}

	await Promise.all(
		dirents.map((dirent) => {
			if (dirent.kind === 'file')
				return loadUIComponent(
					fileSystem,
					`${basePath}/${dirent.name}`,
					uiStore,
					disposables
				)
			else
				return loadUIComponents(
					fileSystem,
					uiStore,
					disposables,
					`${basePath}/${dirent.name}`
				)
		})
	)
}

export async function loadUIComponent(
	fileSystem: FileSystem,
	componentPath: string,
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
			;(errors as Error[]).forEach((error) =>
				createErrorNotification(error)
			)
			return reject(errors[0])
		}

		const component = {
			name: basename(componentPath),
			...(await (<any>(
				executeScript(
					script?.content?.replace('export default', 'return') ?? '',
					{ uiStore, disposables }
				)
			))),
			...Vue.compile(
				template?.content ?? `<p color="red">NO TEMPLATE DEFINED</p>`
			),
		}
		// Add vuetify components in
		component.components = Object.assign(
			component.components ?? {},
			VuetifyComponents
		)

		styles.forEach((style) =>
			disposables.push(createStyleSheet(style.content))
		)

		resolve(component)
	})

	uiStore.set(relative('ui', componentPath).split(/\\|\//g), () => promise)
}
