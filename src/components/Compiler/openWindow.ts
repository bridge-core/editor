import { InformedChoiceWindow } from '/@/components/Windows/InformedChoice/InformedChoice'
import { App } from '/@/App'
import { isUsingFileSystemPolyfill } from '/@/components/FileSystem/Polyfill'
import { InfoPanel, IPanelOptions } from '/@/components/InfoPanel/InfoPanel'
import json5 from 'json5'

export async function openCompilerWindow() {
	const app = await App.getApp()
	const project = app.project
	const comMojang = app.comMojang
	const { hasComMojang, didDenyPermission } = comMojang.status

	const configDir = await project.fileSystem.getDirectoryHandle(
		`.bridge/compiler`,
		{ create: true }
	)
	const informedChoice = new (class extends InformedChoiceWindow {
		constructor() {
			super('sidebar.compiler.name')

			let panelConfig: IPanelOptions

			if (isUsingFileSystemPolyfill.value) {
				panelConfig = {
					text: 'comMojang.status.notAvailable',
					type: 'error',
					isDismissible: false,
				}
			} else if (!hasComMojang && didDenyPermission) {
				panelConfig = {
					text: 'comMojang.status.deniedPermission',
					type: 'warning',
					isDismissible: false,
				}
			} else if (hasComMojang && !didDenyPermission) {
				panelConfig = {
					text: 'comMojang.status.sucess',
					type: 'success',
					isDismissible: false,
				}
			} else if (!hasComMojang) {
				panelConfig = {
					text: 'comMojang.status.notSetup',
					type: 'error',
					isDismissible: false,
				}
			} else {
				throw new Error(`Invalid com.mojang status`)
			}

			this.topPanel = new InfoPanel(panelConfig)
		}
	})()

	const actionManager = await informedChoice.actionManager

	actionManager.create({
		icon: 'mdi-cog',
		name: 'sidebar.compiler.default.name',
		description: 'sidebar.compiler.default.description',
		onTrigger: async () => {
			const service = await project.createDashService('production')
			await service.setup()
			await service.build()
		},
	})

	for await (const entry of configDir.values()) {
		if (
			entry.kind !== 'file' ||
			entry.name === '.DS_Store' ||
			entry.name === 'default.json' // Default compiler config already gets triggerd with the default action above (outside of the loop)
		)
			continue
		const file = await entry.getFile()

		let config
		try {
			config = json5.parse(await file.text())
		} catch {
			continue
		}

		actionManager.create({
			icon: config.icon,
			name: config.name,
			description: config.description,
			onTrigger: async () => {
				const service = await project.createDashService(
					'production',
					`projects/${project.name}/.bridge/compiler/${entry.name}`
				)
				await service.setup()
				await service.build()
			},
		})
	}
}
