import { IDisposable } from '/@/types/disposable'
import { TUIStore } from '../UI/store'

import { AnyDirectoryHandle } from '../../FileSystem/Types'
import { JsRuntime } from './JsRuntime'
import { iterateDir } from '/@/utils/iterateDir'

export async function loadScripts(
	jsRuntime: JsRuntime,
	baseDirectory: AnyDirectoryHandle
) {
	await iterateDir(
		baseDirectory,
		async (fileHandle, filePath) => {
			const fileContent = await fileHandle
				.getFile()
				.then((file) => file.text())
			await jsRuntime.run(filePath, undefined, fileContent)
		},
		undefined,
		'scripts'
	)
}

export interface IScriptContext {
	jsRuntime?: JsRuntime
	uiStore: TUIStore
	disposables: IDisposable[]
	extensionId: string
	language?: 'javaScript' | 'typeScript'
	isGlobal?: boolean
}

export function executeScript(
	jsRuntime: JsRuntime,
	filePath: string,
	code: string
) {
	return jsRuntime.run(filePath, undefined, code)
}
