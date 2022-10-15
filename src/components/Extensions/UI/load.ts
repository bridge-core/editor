import { extname, basename } from '/@/utils/path'
import { createErrorNotification } from '/@/components/Notifications/Errors'
import { TUIStore } from './store'
import { IDisposable } from '/@/types/disposable'
import { createStyleSheet } from '../Styles/createStyle'
import Vue from 'vue'
import {
	VBtn,
	VAlert,
	VApp,
	VToolbar,
	VToolbarItems,
	VAutocomplete,
	VCombobox,
	VSwitch,
	VTextField,
	VWindow,
	VTooltip,
} from 'vuetify/lib'
import { AnyDirectoryHandle } from '../../FileSystem/Types'
import { useVueTemplateCompiler } from '/@/utils/libs/useVueTemplateCompiler'
import { iterateDir } from '/@/utils/iterateDir'
import { JsRuntime } from '../Scripts/JsRuntime'

const VuetifyComponents = {
	VBtn,
	VAlert,
	VApp,
	VToolbar,
	VToolbarItems,
	VAutocomplete,
	VCombobox,
	VSwitch,
	VTextField,
	VWindow,
	VTooltip,
}

export async function loadUIComponents(
	jsRuntime: JsRuntime,
	baseDirectory: AnyDirectoryHandle,
	uiStore: TUIStore,
	disposables: IDisposable[]
) {
	await iterateDir(
		baseDirectory,
		async (fileHandle, filePath) => {
			await loadUIComponent(
				jsRuntime,
				filePath,
				await fileHandle.getFile().then((file) => file.text()),
				uiStore,
				disposables
			)
		},
		undefined,
		'ui'
	)

	uiStore.allLoaded.dispatch()
}

export async function loadUIComponent(
	jsRuntime: JsRuntime,
	componentPath: string,
	fileContent: string,
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

	const { parseComponent } = await useVueTemplateCompiler()

	const promise = new Promise(async (resolve, reject) => {
		//@ts-expect-error "errors" is not defined in .d.ts file
		const { template, script, styles, errors } = parseComponent(fileContent)

		if (errors.length > 0) {
			;(errors as Error[]).forEach((error) =>
				createErrorNotification(error)
			)
			return reject(errors[0])
		}

		const { __default__: componentDef } = script?.content
			? await jsRuntime.run(
					componentPath,
					undefined,
					script?.content ?? ''
			  )
			: { __default__: {} }

		const component = {
			name: basename(componentPath),
			...componentDef,
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

	uiStore.set(componentPath.replace('ui/', '').split('/'), () => promise)
}
