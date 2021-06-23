import { IDisposable } from '/@/types/disposable'
import { TUIStore } from '../UI/store'
import { createEnv } from './require'
import { run } from './run'

export async function loadScripts(
	baseDirectory: FileSystemDirectoryHandle,
	uiStore: TUIStore,
	disposables: IDisposable[]
) {
	for await (const entry of baseDirectory.values()) {
		if (entry.kind === 'directory') {
			await loadScripts(entry, uiStore, disposables)
		} else if (entry.kind === 'file') {
			const file = await entry.getFile()
			await executeScript(await file.text(), {
				uiStore,
				disposables,
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
}

export function executeScript(
	code: string,
	{ uiStore, disposables, language }: IScriptContext
) {
	return run({
		async: true,
		script: code,
		language,
		env: {
			require: createEnv(disposables, uiStore),
		},
	})
}
