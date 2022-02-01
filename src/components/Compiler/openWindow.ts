import { CompilerWindow } from './Window/Window'

export async function openCompilerWindow() {
	return new CompilerWindow().open()
}
