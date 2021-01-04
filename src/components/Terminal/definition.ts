import './Commands/collect'
import { createWindow } from '@/components/Windows/create'
import Terminal from './Main.vue'

export const terminalWindow = createWindow(Terminal, {
	autoCompletions: [],
	commandParts: [],
	currentCommandPart: '',
})
