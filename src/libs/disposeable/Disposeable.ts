export interface Disposable {
	dispose: () => void
}

export interface AsyncDisposable {
	dispose: () => Promise<void>
}

export function disposeAll(disposables: Disposable[]) {
	for (const disposable of disposables) {
		disposable.dispose()
	}
}
