import { runAsync } from './run'
import { createEnv } from './require'
import { TUIStore } from '../UI/store'
import { IDisposable } from '@/types/disposable'

export function executeScript(
	code: string,
	uiStore: TUIStore,
	disposables: IDisposable[]
) {
	return runAsync(code, { require: createEnv(disposables, uiStore) })
}
