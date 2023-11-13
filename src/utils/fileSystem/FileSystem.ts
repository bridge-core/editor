import { LocalFileSystem } from './LocalFileSystem'
import { PWAFileSystem } from './PWAFileSystem'
import { TauriFileSystem } from './TauriFileSystem'

export async function createFileSystem() {
	if (import.meta.env.VITE_IS_TAURI_APP) return new TauriFileSystem()

	if (supportsFileHandles()) return new PWAFileSystem()

	return new LocalFileSystem()
}

function supportsFileHandles() {
	return (
		!fileHandlesUnsupportedBrowser() &&
		typeof window.showDirectoryPicker === 'function'
	)
}

function fileHandlesUnsupportedBrowser() {
	const unsupportedChromeVersions = ['93', '94']

	// @ts-ignore: TypeScript doesn't know about userAgentData yet
	const userAgentData: any = navigator.userAgentData
	if (!userAgentData) return true

	const chromeBrand = userAgentData.brands.find(
		({ brand }: any) => brand === 'Google Chrome'
	)
	const edgeBrand = userAgentData.brands.find(
		({ brand }: any) => brand === 'Microsoft Edge'
	)
	const operaBrand = userAgentData.brands.find(
		({ brand }: any) => brand === 'Opera GX' || brand === 'Opera'
	)
	if (chromeBrand)
		return unsupportedChromeVersions.includes(chromeBrand.version)

	if (edgeBrand || operaBrand) return false

	return true
}
