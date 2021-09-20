import { IDisposable } from '/@/types/disposable'
import { TUIStore } from '../UI/store'
import { createEnv } from './require'
import { run } from './run'
import { AnyDirectoryHandle } from '../../FileSystem/Types'

export async function loadScripts(
	baseDirectory: AnyDirectoryHandle,
	uiStore: TUIStore,
	disposables: IDisposable[],
	isGlobal = false
) {
	for await (const entry of baseDirectory.values()) {
		if (entry.kind === 'directory') {
			await loadScripts(entry, uiStore, disposables, isGlobal)
		} else if (entry.kind === 'file') {
			const file = await entry.getFile()
			await executeScript(await file.text(), {
				uiStore,
				disposables,
				isGlobal,
				language: entry.name.endsWith('.ts')
					? 'typeScript'
					: 'javaScript',
			})
		}
	}
}

export interface IScriptContext {
	uiStore: TUIStore
	disposables: IDisposable[]
	language?: 'javaScript' | 'typeScript'
	isGlobal?: boolean
}

export function executeScript(
	code: string,
	{ uiStore, disposables, language, isGlobal = false }: IScriptContext
) {
	return run({
		async: true,
		script: code,
		language,
		env: {
			require: createEnv(disposables, uiStore, isGlobal),
		},
	})
}
