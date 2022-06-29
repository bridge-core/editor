import { Signal } from '../../components/Common/Event/Signal'

export const loadMonaco = new Signal<void>()

export async function useMonaco() {
	await loadMonaco.fired
	return await import('monaco-editor')
}
