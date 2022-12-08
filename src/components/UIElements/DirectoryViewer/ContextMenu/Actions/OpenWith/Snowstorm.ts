import { FileWrapper } from '/@/components/UIElements/DirectoryViewer/FileView/FileWrapper'
import { App } from '/@/App'
import json5 from 'json5'
import { strFromU8, zlibSync } from 'fflate'
import { IframeTab } from '/@/components/Editors/IframeTab/IframeTab'
import { findFileExtension } from '/@/components/FileSystem/FindFile'
import { FileSystem } from '/@/components/FileSystem/FileSystem'

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

				// Get texture path from particle json
				const texturePath: string | undefined =
					particleJson?.particle_effect?.description
						?.basic_render_parameters?.texture
				const fullTexturePath = texturePath
					? await findFileExtension(
							app.fileSystem,
							app.projectConfig.resolvePackPath(
								'resourcePack',
								texturePath
							),
							['.tga', '.png', '.jpg', '.jpeg']
					  )
					: undefined
				let rawTextureData: Uint8Array | null = null
				if (fullTexturePath) {
					rawTextureData = await app.fileSystem
						.getFileHandle(fullTexturePath)
						.then((fileHandle) => fileHandle.getFile())
						.then((file) => file.arrayBuffer())
						.then((buffer) => new Uint8Array(buffer))
				}

				const base64 = btoa(
					strFromU8(zlibSync(rawParticle, { level: 9 }), true)
				)
				const url = new URL('https://snowstorm.app/')
				url.searchParams.set('loadParticle', base64)
				if (rawTextureData) {
					const base64Texture = btoa(
						strFromU8(zlibSync(rawTextureData, { level: 9 }), true)
					)
					url.searchParams.set('loadParticleTexture', base64Texture)
				}

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
