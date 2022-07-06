import { FileWrapper } from '/@/components/UIElements/DirectoryViewer/FileView/FileWrapper'
import { App } from '/@/App'
import json5 from 'json5'
import { strFromU8, zlibSync } from 'fflate'
import { IframeTab } from '/@/components/Editors/IframeTab/IframeTab'

export const SnowstormAction = (fileWrapper: FileWrapper) => {
	if (!fileWrapper.name.endsWith('.json')) return null
	const path = fileWrapper.path
	if (!path) return null

	const fileType = App.fileType.getId(path)

	if (
		fileType === 'particle' ||
		(fileType === 'unknown' && path.includes('particles/'))
	)
		return {
			icon: 'mdi-snowflake',
			name: 'openWith.snowstorm',
			onTrigger: async () => {
				const app = await App.getApp()
				const tabSystem = app.tabSystem
				if (!tabSystem) return

				const file = await fileWrapper.handle.getFile()
				const particleJson = json5.parse(await file.text())
				const rawParticle = new Uint8Array(await file.arrayBuffer())

				const base64 = btoa(
					strFromU8(zlibSync(rawParticle, { level: 9 }), true)
				)
				const url = new URL('https://snowstorm.app/')
				url.searchParams.set('loadParticle', base64)

				tabSystem.add(
					new IframeTab(tabSystem, {
						icon: 'mdi-snowflake',
						name: `Snowstorm: ${fileWrapper.name}`,
						url: url.href,
						iconColor: 'primary',
					})
				)
			},
		}

	return null
}
