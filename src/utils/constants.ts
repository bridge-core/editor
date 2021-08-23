import { platform } from './os'

export const platformRedoBinding =
	platform() === 'darwin' ? 'Ctrl + Shift + Z' : ' Ctrl + Y'
