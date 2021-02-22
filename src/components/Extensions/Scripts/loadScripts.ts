import { IDisposable } from '/@/types/disposable'
import { TUIStore } from '../UI/store'
import { createEnv } from './require'
import { runAsync } from './run'

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
			await executeScript(await file.text(), uiStore, disposables)
		}
	}
}

export function executeScript(
	code: string,
	uiStore: TUIStore,
	disposables: IDisposable[]
) {
	return runAsync(code, createEnv(disposables, uiStore), ['require'])
}
